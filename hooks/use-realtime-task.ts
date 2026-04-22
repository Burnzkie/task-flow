"use client";
import { useEffect } from "react";
import {supabase} from "@/lib/supabase";
import type {Task} from "@/types";

type SetTasks = React.Dispatch<React.SetStateAction<Task[]>>;

export function useRealtimeTasks(userId: string, setTasks: SetTasks){
    useEffect(() =>{
        //Subscribe to all changes tasks table
        const channel = supabase
        .channel("tasks-realtime")
        .on("postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "tasks",
                filter: `userId=eq.${userId}`,
            },
            (payload) =>{
                //Patch local state based on what changed
                if(payload.eventType === "INSERT"){
                    // A new task was created
                    setTasks((prev) =>[...prev, payload.new as Task]);  
            }
            if (payload.eventType ==="UPDATE" ){
                //A task was edited
                setTasks((prev) =>
                prev.map((t) => (t.id === payload.new.id ? (payload.new as Task): t)));
            }
            if (payload.eventType === "DELETE"){
                // A task was deleted
                setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
            }
          }
        )
        .subscribe();
        return() => {supabase.removeChannel(channel);};
    }, [userId, setTasks]);
}