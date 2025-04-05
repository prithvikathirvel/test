import React from 'react'
import { Paper } from '@mui/material'
import { Network } from 'lucide-react'
import DashedBox from '../Common/DashedBox'

const DetailsCard = ({title,icon,flows,width='80',color='#6c5ce7'}) => {
  return (
   <DashedBox>
     <Paper
      elevation={0}
      className={`!min-w-80 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}
    >
    <div className="flex items-center">
      <div className={`h-10 w-10 rounded-full bg-[${color}]/20 flex items-center justify-center mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{flows.length}</p>
      </div>
    </div>
  </Paper> 
   </DashedBox> 
  )
}

export default DetailsCard