//Section where user can see how his website looks on giving the prompt

import React, { forwardRef } from 'react'
import type { Project } from '../types';

interface ProjectPreviewProps{
    project: Project;
    isgenerating:boolean;
    device?:'phone' | 'tablet' | 'desktop';
    showEditPanel?:boolean;
}

    export interface ProjectPreviewRef{
        getcode: ()=> string | undefined;
    }

//to pass data from this component to parent component we use forward ref.
const ProjextPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({project,isgenerating,device='desktop', showEditPanel=true},ref) => {
  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
      {project.current_code ? (
        <>
        <iframe 
        
        />
        </>
      ):isgenerating && (
        <div>loading</div>
      )}
    </div>
  )
})

export default ProjextPreview
