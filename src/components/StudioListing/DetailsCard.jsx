import React from 'react'

const DetailsCard = ({ title, icon, flows = [], subtitle = "Workflows" }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <span className="text-xs font-medium text-zinc-500 block mb-2">
        {title}
      </span>
      <div className="text-2xl font-bold text-zinc-900">
        {flows.length}
      </div>
      <p className="text-[11px] text-zinc-400 mt-1">
        {subtitle}
      </p>
    </div>
  )
}

export default DetailsCard
