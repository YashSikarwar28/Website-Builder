import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { dummyProjects } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';
import ProjextPreview from '../components/ProjextPreview';
import type { Project } from '../types';

const Preview = () => {

  const{projectId,versionId}=useParams();
  const[code,setCode]=useState('');
  const[loading,setLoading]=useState(true);

   const fetchcode=async () => {
     setTimeout(() => {
      const code=dummyProjects.find(project=>project.id===projectId)?.current_code;
      if(code){
        setCode(code);
        setLoading(false);
      }
    }, 2000);
  }

  useEffect(()=>{
    fetchcode();
  },[])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200'/>
      </div>
    )
  }

  return (
    <div className='h-screen'>
      {code && <ProjextPreview project={{current_code:code} as Project} isgenerating={false} showEditPanel={false}/>}
    </div>
  )
}

export default Preview
