"use server"
import prisma from "@/lib/prisma"
import {z} from "zod"
import { authenticatedAction } from "@/lib/safe-actions"
import { extractHashtags } from "@/components/utils/extractHashtags"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// User can delete his post
export const deletePost = authenticatedAction
    .schema(z.object({
        postId: z.string(),
    }))
    .action(async ({parsedInput: {postId}, ctx:{userId}}) => {
        const post = await prisma.post.findUnique({
            where: {id: postId, authorId: userId}
        })

        if(!post || post.authorId !== userId) {
            throw new Error("Post not found or you are not the author")
        }

        await prisma.post.delete({
            where: {id: postId}
        })

        revalidatePath("/")
})

// Like the post
export const likePost = authenticatedAction
    .schema(z.object({
        postId: z.string(),
    }))
    .action(async ({parsedInput: {postId}, ctx:{userId}}) => {
        const post = await prisma.post.findUnique({
            where: {id: postId}
        })

        if(!post) {
            throw new Error("Post not found")
        }

        const userLikedPost = await prisma.like.findUnique({
            where: {authorId_postId: {postId, authorId: userId}}
        })

        if (userLikedPost) {
            await prisma.like.delete({
              where: { id: userLikedPost.id },
            })
          } else {
            const post = await prisma.post.findUnique({
              where: { id: postId },
              select: { authorId: true },
            })
      
            if (!post) throw new Error("Post not found")
      
            await prisma.$transaction([
                prisma.like.create({
                  data: {
                    authorId: userId,
                    postId: postId,
                  },
                }),
                prisma.notification.create({
                  data: {
                    userId: userId,
                    type: "LIKE",
                    content: `${userId} liked your post`,
                    relatedId: postId,
                  },
                }),
              ])
            }
        revalidatePath(`/post/${postId}`)
    })

// Repost the post
export const repostPost = authenticatedAction
    .schema(z.object({
        postId: z.string(),
    }))
    .action(async ({parsedInput: {postId}, ctx:{userId}}) => {
        const post = await prisma.post.findUnique({
            where: {id: postId}
        })

        if(!post) {
            throw new Error("Post not found")
        }

        const userRepostedPost = await prisma.repost.findUnique({
            where: {authorId_postId: {postId, authorId: userId}}
        })

        if(userRepostedPost) {
            await prisma.repost.delete({
                where: {id: userRepostedPost.id}
            })
        } else {
            await prisma.$transaction([
                prisma.repost.create({
                  data: {
                    authorId: userId,
                    postId: postId,
                  },
                }),
                prisma.notification.create({
                    data: {
                        userId: userId,
                        type: "REPOST",
                        content: `${userId} reposted your post`,
                        relatedId: postId,
                    }
                })
            ])
        }

        revalidatePath(`/post/${postId}`)
    })

// Create a comment
export const createComment = authenticatedAction
    .schema(z.object({
        postId: z.string(),
        content: z.string().min(1).max(280),
    }))
    .action(async ({parsedInput: {postId, content}, ctx:{userId}}) => {
        const post = await prisma.post.findUnique({
            where: {id: postId}
        })

        if(!post) {
            throw new Error("Post not found")
        }

        await prisma.$transaction([
            prisma.comment.create({
                data: {
                    postId,
                    content,
                    authorId: userId,
                }
            }),
            prisma.notification.create({
                data: {
                    userId: userId,
                    type: "COMMENT",
                    content: `${userId} commented on your post`,
                    relatedId: postId,
                }
            })
        ])

        revalidatePath(`/post/${postId}`)
    })
