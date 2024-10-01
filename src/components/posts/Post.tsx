import { formatPostDate } from "../utils/FormatDate";
import Link from "next/link";
import { MessageSquare, Share2, Repeat2} from "lucide-react";
import { Ellipsis } from "./Ellipsis"
import { getSession } from "@/components/utils/CacheSession"
import { LikePost } from "./LikePost";

export const Post = async ({post}: {post: any}) => {  
  const session = await getSession()

  return <div className="flex flex-col gap-4 justify-end w-full items-end relative mb-5">
    {post.comments.length > 0 && (
        <div className="absolute max-sm:hidden w-[300px] -bottom-5 left-8 dark:bg-[#181818] shadow-md dark:border-zinc-800 border-zinc-200 border p-2 rounded-lg text-sm max-w-[80%] z-10 hover:dark:bg-[#202020] hover:bg-gray-100 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
                <img src={post.comments[0].author.image} alt={post.comments[0].author.name} className="w-7 h-7 rounded-full" />
                <Link href={`/profile/${post.comments[0].author.id}`} className="hover:underline">
                  <p className="font-bold">{post.comments[0].author.name}</p>
                </Link>
            </div>
          <p>{post.comments[0].content.length > 100 ? `${post.comments[0].content.slice(0, 100)}...` : post.comments[0].content}</p>
          <div className="absolute -top-5 right-4 w-0.5 z-10 h-[10px] bg-zinc-700 transform translate-y-full"></div>
          <div className="absolute -top-5 left-4 w-0.5 z-10 h-[10px] bg-zinc-700 transform translate-y-full"></div>
        </div>
      )}
    <div className="dark:bg-[#181818] shadow-xl w-full hover:dark:bg-[#202020] hover:bg-gray-100 transition-all duration-300 px-5 rounded-3xl border dark:border-zinc-800 border-zinc-200 p-4 flex gap-4">
        <img src={post.author.image} alt={post.author.name} className="w-10 h-10 rounded-full" />

        {session?.user?.id === post.author.id && <Ellipsis />}

        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.author.id}`}>
                        <span className="text-sm hover:underline font-bold">{post.author.name}</span>
                    </Link>
                    <span className="text-sm dark:text-gray-500 text-gray-500">@{post.author.username ? post.author.username : post.author.name}</span>
                </div>
                <span className="text-sm dark:text-gray-500 text-gray-500">{formatPostDate(post.createdAt)}</span>
            </div>

            <p className="text-md dark:text-gray-300 text-gray-700">{post.content}</p>
            {post.image && <img src={post.image} alt={post.content} className="w-full h-auto rounded-lg" />}
        </div>
    </div>

    <div className="w-[220px] p-3 dark:bg-[#181818] shadow-md dark:border-zinc-800 border-zinc-200 border rounded-full flex items-center justify-between">
      <LikePost postId={post.id} isLiked={post.isLiked} likesCount={post._count.likes} />

      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <MessageSquare size={19} className="text-blue-500 fill-blue-500 z-10 relative"/>
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300"></div>
        </div>
        <span className="text-sm text-gray-400">{post._count.comments}</span>
      </div>

      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <Repeat2 size={19} className="text-green-500 fill-green-500 z-10 relative"/>
          <div className="absolute inset-0 bg-green-500 rounded-full opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300"></div>
        </div>
        <span className="text-sm text-gray-400">{post._count.reposts}</span>
      </div>

      <div className="relative group">
        <Share2 size={19} className="cursor-pointer text-gray-500 group-hover:text-yellow-500 duration-300 z-10 relative"/>
        <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300"></div>
      </div>
    </div>
  </div>
}