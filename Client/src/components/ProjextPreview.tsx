//Section where user can see how the website looks on giving the prompt

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Project } from "../types";
import { iframeScript } from "../assets/assets";
import EditorPanel from "./EditorPanel";

interface ProjectPreviewProps {
  project: Project;
  isgenerating: boolean;
  device?: 'phone' | 'tablet' | 'desktop';
  showEditPanel?: boolean;
}

export interface ProjectPreviewRef {
  getcode: () => string | undefined;
}

//to pass data from this component to parent component we use forward ref.
const ProjextPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  (
    { project, isgenerating, device = "desktop", showEditPanel = true },
    ref,
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedElements,setSelectedElements]=useState<any>(null);

    const resolutions = {
      phone:'w-[412px]',
      tablet:'w-[768px]',
      desktop:'w-full'
    }

    //to download the generated website code
    useImperativeHandle(ref,()=>({
      getcode:()=>{
        const doc=iframeRef.current?.contentDocument;
        if(!doc) return undefined;

        doc.querySelectorAll('ai.selected-element,[data-ai-selected]').forEach((el)=>{
          el.classList.remove('ai-selected-element');
          el.removeAttribute('data-ai-selected');
          (el as HTMLElement).style.outline='';
        })

        const previewStyle=doc.getElementById('ai-preview-style');
        if(previewStyle) previewStyle.remove();

        const previewScript=doc.getElementById('ai-preview-script');
        if(previewScript) previewScript.remove();

        const html=doc.documentElement.outerHTML;
        return html;
      }
    }))

    useEffect(()=>{
      const handleMsg=(event:MessageEvent)=>{
          if (event.data.type==='ELEMENT_SELECTED') {
            setSelectedElements(event.data.payload);
          }else if(event.data.type==='CLEAR_SELECTION'){
            setSelectedElements(null);
          }
      }
      window.addEventListener('message',handleMsg);
      return ()=>window.removeEventListener('message',handleMsg);
    },[])

    const handleupdate=(updates:any)=>{
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type:'UPDATE_ELEMENT',
          payload:updates
        },'*')
      }
    }

    const injectPreview = (html: string) => {
      if (!html) return '';
      if (!showEditPanel) return html;

      if (html.includes('</body>')) {
        return html.replace('</body>', iframeScript + '</body>');
      } else {
        return html + iframeScript;
      }
    };
    
    return (
      <div className="relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2">
        {project.current_code ? (
          <>
            <iframe
              ref={iframeRef}
              srcDoc={injectPreview(project.current_code)}
              className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}
            />
            {showEditPanel && selectedElements && (
              <EditorPanel selectedElements={selectedElements} onUpdate={handleupdate} onClose={()=>{
                setSelectedElements(null);
                if (iframeRef.current?.contentWindow) {
                  iframeRef.current.contentWindow.postMessage({type:'CLEAR_SELECTION_REQUEST'},'*')
                }
              }}/>
            )}
          </>
        ) : (
          isgenerating && <div>loading</div>
        )}
      </div>
    );
  },
);

export default ProjextPreview;
