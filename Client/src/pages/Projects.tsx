//Project page where the website is builded

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquare,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProjextPreview, {
  type ProjectPreviewRef,
} from "../components/ProjextPreview";
import api from "@/configs/axios";
import { toast } from "sonner";
import { ERROR_CODES } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setproject] = useState<Project | null>(null);
  const [loading, setloading] = useState(true);

  //chatbox btn - while the message is loading the btn is disabled
  const [isgenerating, setisgenerating] = useState(true);

  const [device, setdevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop",
  );

  const [isMenuOpen, setIsmenuopen] = useState(false);
  const [isSaving, setisSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null);

  const { data: session, isPending } = authClient.useSession();



  const fetchProjects = async () => {
  try {
    const { data } = await api.get(`/api/user/project/${projectId}`);

    console.log("FETCH RESPONSE:", data);
    console.log("status:",data.project.status);
    console.log("code",data.project.current_code);

    if (!data?.project) return;

    setproject(data.project);
    setisgenerating(
      data.project.status !== "ready" &&
      data.project.status !== "failed"
    );

    return data.project;
  } catch (error: any) {
    console.log(error);
  }finally{
    setloading(false);
  }
};

//   const fetchProjects = async () => {
//   try {
//     const { data } = await api.get(
//       `/api/user/project/${projectId}`
//     );

//     console.log("FETCH RESPONSE:", data);

//     if (!data?.project) {
//       console.warn("Project not found");
//       return;
//     }

//     setproject(data.project);
//     //setisgenerating(!data.project.current_code);
//     setisgenerating(data.project.status !== "ready")
//   } catch (error: any) {
//     console.log(error);
//     toast.error(error?.response?.data?.message || error.message);
//   } finally {
//     setloading(false);
//   }
// };


  //save your project
  const saveProject = async () => {};

  //download your code(index.html)
  const downloadCode = () => {
    const code = previewRef.current?.getcode() || project?.current_code;
    if (!code) {
      if (isgenerating) {
        return;
      }
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text.html" });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  };

  //publishing your code
  const togglePublish = async () => {};

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    } else if (!isPending && !session?.user) {
      navigate("/");
      toast("Login to view your projects");
    }
  }, [session?.user]);

  useEffect(() => {
  if (!projectId) return;

  const intervalId = setInterval(async () => {
    const data = await fetchProjects();

    if (
      data?.status === "ready" ||
      data?.status === "failed"
    ) {
      clearInterval(intervalId);
    }
  }, 3000);

  return () => clearInterval(intervalId);
}, [projectId]);
  
  // useEffect(() => {
  //   if (project && !project.current_code) {
  //     const intervalId = setInterval(fetchProjects, 10000);
  //     return () => clearInterval(intervalId);
  //   }
  // }, [project]);

  //loading animation
  if (loading || !project) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <Loader2Icon className="size-7 animate-spin text-violet-300" />
        </div>
      </>
    );
  }

  return project ? (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar">
        {/* left part */}
        <div>
          {/* className="flex items-center gap-2 sm:min-w-90 text-nowrap" */}
          <img
            src="/favicon.svg"
            alt=""
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="max-w-64 sm:max-w-xs">
          <p className="text-sm font-medium capitalize truncate">
            {project.name}
          </p>

          <p className="text-xs text-gray-300 -mt-0.5">
  {project.status === "failed"
    ? "Generation failed"
    : project.status === "ready"
    ? "Ready"
    : "Generating..."}
</p>
          {/* <p className="text-xs text-gray-300 -mt-0.5">Wating for response</p> */}
        </div>
        <div className="sm:hidden flex-1 justify-end">
          {isMenuOpen ? (
            <MessageSquareIcon
              onClick={() => setIsmenuopen(false)}
              className="size-6 cursor-pointer"
            />
          ) : (
            <XIcon
              onClick={() => setIsmenuopen(true)}
              className="size-6 cursor-pointer"
            />
          )}
        </div>

        {/* middle part */}
        <div className="hidden sm:flex gap-2 bg-gray-900 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setdevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "phone" ? "bg-gray-700" : ""}`}
          />
          <TabletIcon
            onClick={() => setdevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""}`}
          />
          <LaptopIcon
            onClick={() => setdevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""}`}
          />
        </div>

        {/* right part */}
        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 sm:rounded-sm text-white px-3.5 py-1 flex items-center gap-2 rounded transition-colors border border-gray-700"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>
          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-purple-700 transition-colors"
          >
            <FullscreenIcon size={16} />
            Preview
          </Link>
          <button
            onClick={downloadCode}
            className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors"
          >
            <ArrowBigDownDashIcon size={16} />
            Download
          </button>
          <button
            onClick={togglePublish}
            className="bg-linear-to-br from-indigo-600 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors"
          >
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex-1 flex overflow-auto">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setproject={(p) => setproject(p)}
          isgenerating={isgenerating}
          setisgenerating={setisgenerating}
        />

        <div className="flex-1 p-2 pl-0">
          <ProjextPreview
            ref={previewRef}
            project={project}
            isgenerating={isgenerating}
            device={device}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load projects
      </p>
    </div>
  );
};

export default Projects;
