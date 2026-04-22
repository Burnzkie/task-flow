"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend} from "recharts";


const STATUS_CONFIG: Record<string, {label: string; color: string}> ={
    BACKLOG:            {label: "Backlog" ,             color: "#5a5a6a"},   
    TODO:               {label: "To Do",                color: "#5eb8f7"},
    IN_PROGRESS:        {label: "In Progress",            color: "#f5a623"},
    IN_REVIEW:          {label: "In Review",             color: "#7c6af7"},
    DONE:               {label: "Done",                 color:"#5ec97c"},   
};


interface Props{
    data: {name: string; value: number} [];
}

export default function StatusChart({data}: Props){
    const formatted = data.map((d) => ({
        ...d,
        label: STATUS_CONFIG[d.name]?.label ?? d.name,
        color: STATUS_CONFIG[d.name]?.color ?? "#888",
    }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie data={formatted}
                     dataKey="value"
                     nameKey="label"
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={3}
                     >
                        {formatted.map((entry, i) =>(
                            <Cell key={i} fill={entry.color} />
                        ))}
                </Pie>
                <Tooltip contentStyle={{
                    background: "#1e1e22",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                }}
                />
                <Legend iconType="circle"
                iconSize={8}
                wrapperStyle={{fontSize: 11, color: "#888"}}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}