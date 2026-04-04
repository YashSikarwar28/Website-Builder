import {Request,Response} from 'express'
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

//controller function for making revision
export const makeRevision=async (req:Request,res:Response) => {
    const userId=req.userId;
    try {
        const {projectId}=req.params;
        const {message}=req.body;

        const user=await prisma.user.findUnique({
            where:{id:userId}
        })

        if(!userId || !user){
            return res.status(401).json({message:'Unauthorized'})
        }
        if (user.credits<5) {
            return res.status(403).json({message:'Add more credits to make changes.'})
        }
        if (!message || message.trim() === '') {
            return res.status(400).json({message:'Please enter a valid prompt'})
        }
        const currentProject=await prisma.websiteProject.findUnique({
            where:{id:project,userId},
            include:{versions:true}
        })

        if (!currentProject) {
            return res.status(404).json({message:'Project not found'})
        }

        await prisma.conversation.create({
            data:{
                role:'user',
                content:message,
                projectId
            }
        })

        await prisma.user.update({
            where:{id:userId},
            data:{credits:{decrement:5}}
        })

        //Enhance user prompt
        const promptEnhanceResponse=await openai.chat.completions.create({
            model:'z-ai/glm-4.5-air:free',
            messages:[{
                role:'system',
                content:`
                You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

    Enhance this by:
    1. Being specific about what elements to change
    2. Mentioning design details (colors, spacing, sizes)
    3. Clarifying the desired outcome
    4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
`
            },{
                role:'user',
                content:`User's request: "${message}"`
            }]
        })
        const enhancedPrompt=promptEnhanceResponse.choices[0].message.content;
        
        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`Enhanced prompt: "${enhancedPrompt}"`,
                projectId
            }
        })
        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:'Now making changes to your website...',
                projectId
            }
        })

        //Generate website code
        const codeGenerationResponse = await openai.chat.completions.create({
            model:'z-ai/glm-4.5-air:free',
            messages:[
                {
                    role:'system',
                    content:``
                }
            ]
        })
    } catch (error) {
        
    }
}