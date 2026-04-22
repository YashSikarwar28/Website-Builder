import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

/* -------------------- GET USER CREDITS -------------------- */
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.json({ credits: user?.credits ?? 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------- CREATE PROJECT -------------------- */
export const createUserProject = async (req: Request, res: Response) => {
  let projectId: string | null = null;

  try {
    const userId = req.userId;
    const { initial_prompt } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!initial_prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.credits < 5) {
      return res.status(403).json({
        message: "Insufficient credits",
      });
    }

    /* ✅ CREATE PROJECT */
    const project = await prisma.websiteProject.create({
      data: {
        name:
          initial_prompt.length > 50
            ? initial_prompt.substring(0, 49) + "..."
            : initial_prompt,
        initial_prompt,
        userId,
        status: "pending",
      },
    });

    projectId = project.id;

    /* ✅ UPDATE USER */
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalCreation: { increment: 1 },
        credits: { decrement: 5 },
      },
    });

    /* ✅ SAVE USER MESSAGE */
    await prisma.conversation.create({
      data: {
        role: "user",
        content: initial_prompt,
        projectId: project.id,
      },
    });

    /* 🚀 SEND RESPONSE FAST */
    res.json({ projectId: project.id });

    /* ================= AI PROCESS ================= */

    /* 🔄 SET GENERATING */
    await prisma.websiteProject.update({
      where: { id: project.id },
      data: { status: "generating" },
    });

    let rawCode = "";

    try {
      const response: any = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo", // ✅ stable model
        messages: [
          {
            role: "system",
            content: `Return ONLY a complete HTML document.

Rules:
- Start with <!DOCTYPE html>
- Include <html>, <head>, <body>
- Use Tailwind CDN
- Make it responsive
- No explanation
- No markdown
- Only HTML output`,
          },
          {
            role: "user",
            content: initial_prompt,
          },
        ],
      });

      /* 🔥 DEBUG */
      console.log("FULL AI RESPONSE:", JSON.stringify(response, null, 2));

      rawCode = response?.choices?.[0]?.message?.content;

      if (!rawCode) {
        console.log("❌ AI RETURNED EMPTY CONTENT");
      }
    } catch (err) {
      console.log("❌ AI ERROR:", err);
    }

    /* 🧹 CLEAN HTML */
    let cleanCode = "";

    if (rawCode) {
      const startIndex =
        rawCode.indexOf("<!DOCTYPE html") !== -1
          ? rawCode.indexOf("<!DOCTYPE html")
          : rawCode.indexOf("<html");

      if (startIndex !== -1) {
        cleanCode = rawCode.substring(startIndex).trim();
      }
    }

    /* ❌ FAIL CASE */
    if (!cleanCode) {
      console.log("❌ CLEAN CODE FAILED");

      await prisma.websiteProject.update({
        where: { id: project.id },
        data: { status: "failed" },
      });

      await prisma.conversation.create({
        data: {
          role: "assistant",
          content: "Code generation failed. Please try again.",
          projectId: project.id,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } },
      });

      return;
    }

    /* ✅ SAVE VERSION */
    const version = await prisma.version.create({
      data: {
        code: cleanCode,
        description: "Initial Version",
        projectId: project.id,
      },
    });

    /* ✅ FINAL UPDATE */
    await prisma.websiteProject.update({
      where: { id: project.id },
      data: {
        current_code: cleanCode,
        current_version_index: version.id,
        status: "ready",
      },
    });

    console.log("WEBSITE GENERATED SUCCESSFULLY");

  } catch (error: any) {
    console.log("FINAL ERROR:", error);

    if (projectId) {
      await prisma.websiteProject.update({
        where: { id: projectId },
        data: { status: "failed" },
      });

      await prisma.user.update({
        where: { id: req.userId },
        data: { credits: { increment: 5 } },
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

/* -------------------- GET ALL PROJECTS -------------------- */
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------- GET SINGLE PROJECT -------------------- */
export const getUserProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        conversation: true,
        versions: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------- TOGGLE PUBLISH -------------------- */
export const togglepublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = req.params.projectId as string;

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { isPublished: !project.isPublished },
    });

    res.json({
      message: project.isPublished
        ? "Project Unpublished"
        : "Project Published",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------- PURCHASE CREDITS -------------------- */
export const purchaseCredits = async (_req: Request, res: Response) => {
  return res.json({ message: "Not implemented yet" });
};

