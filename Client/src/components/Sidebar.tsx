//Creating sidebar section where user enters prompt for website creation

import React, { useEffect, useRef, useState } from "react";
import type { Message, Project, Version } from "../types";
import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setproject: (project: Project) => void;
  isgenerating: boolean;
  setisgenerating: (isgenerating: boolean) => void;
}

const Sidebar = ({
  isMenuOpen,
  project,
  setproject,
  isgenerating,
  setisgenerating,
}: SidebarProps) => {

  const[input,setinput]=useState('');

  const messageRef=useRef<HTMLDivElement>(null);

  const Rollback=async(versionId:String)=>{

  }

  const handlerevisions=async(e:React.FormEvent)=>{
    e.preventDefault();
    setisgenerating(true);
    setTimeout(() => {
      setisgenerating(false);
    }, 3000);
  }

  useEffect(()=>{
    if (messageRef.current) {
      messageRef.current.scrollIntoView({behavior:'smooth'})
    }
  },[project.conversation.length,isgenerating])

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl transition-all ${isMenuOpen ? "max-sm:w-0" : "*:w-full"}`}
    >
      <div className="flex flex-col h-full">
        {/* Message Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
          {[...project.conversation, ...project.versions]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            )
            .map((message) => {
              const isMessage = "content" in message;

              if (isMessage) {
                const msg = message as Message;
                const isUSer = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUSer ? "justify-end" : "justify-start"}`}
                  >
                    {!isUSer && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <BotIcon className="size-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isUSer ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none" : "rounded-tl-none bg-gray-800 text-gray-100"}`}
                    >
                      {msg.content}
                    </div>
                    {isUSer && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="size-5 text-gray-200"/>
                      </div>
                    )}
                  </div>
                );
              }
              else{
                const ver=message as Version;
                return(
                  <div key={ver.id} className="w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2">
                    <div className="text-xs font-medium">
                      code updated <br /> <span className="text-gray-500 text-xs font-normal">
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {project.current_version_index === ver.id ? (
                        <button className="px-3 py-1 rounded-md text-xs bg-gray-700">Current version</button>
                      ):(
                        <button onClick={()=>Rollback(ver.id)} className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white">Roll back to this version</button>
                      )}
                      <Link target="_blank" to={`/preview/${project.id}/${ver.id}`}>
                      <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded"/>
                      </Link>
                    </div>
                  </div>
                )
              }
            })}
            {
              isgenerating && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-in to-indigo-700 flex items-center justify-center">
                    <BotIcon className="size-5 text-white" />
                  </div>

                  <div className="flex gap-1.5 h-full items-end">
                    <span className="size-2 rounded-full animate-bounce bg-gray-600" style={{animationDelay:'0s'}} />
                    <span className="size-2 rounded-full animate-bounce bg-gray-600" style={{animationDelay:'0.2s'}} />
                    <span className="size-2 rounded-full animate-bounce bg-gray-600" style={{animationDelay:'0.4s'}} />
                  </div>
                </div>
              )
            }
            <div />
        </div>

        {/* Input area for sending message */}
        <form onSubmit={handlerevisions} action="" className="m-3 relative">
          <div className="flex items-center gap-2">
            <textarea rows={4} placeholder="Enter prompt to generate website" className="flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-purple-500 placeholder-gray-400 transition-all" disabled={isgenerating} onChange={(e)=>setinput(e.target.value)} value={input}/>

              <button disabled={isgenerating || !input.trim()} className="absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-60">
                {isgenerating ? 
                <Loader2Icon className="size-7 p-1.5 animate-spin text-white"/>:<SendIcon className="size-7 p-1.5 text-white"/>}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
