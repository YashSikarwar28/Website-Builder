//Project page where the website is builded

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import { dummyConversations, dummyProjects } from "../assets/assets";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setproject] = useState<Project | null>(null);
  const [loading, setloading] = useState(true);

  //chtbox btn - while the message is loading the btn is disabled
  const [isgenerating, setisgenerating] = useState(true);

  const [device, setdevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  const [isMenuOpen, setIsmenuopen] = useState(false);
  const [isSaving, setisSaving] = useState(false);

  //fetching the project data
  const fetchProjects = async () => {
    const project = dummyProjects.find((project) => project.id === projectId);
    setTimeout(() => {
      if (project) {
        setproject({ ...project, conversation: dummyConversations });
        setloading(false);
        setisgenerating(project.current_code ? false : true);
      }
    }, 2000);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  //loading animation
  if (loading) {
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
      <h1>Projects</h1>
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
