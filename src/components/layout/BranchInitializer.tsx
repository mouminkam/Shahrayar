"use client";
import { useEffect } from "react";
import useBranchStore from "../../store/branchStore";

/**
 * Component to initialize branch store on app load
 * This ensures branches are loaded and a default branch is selected
 */
export default function BranchInitializer() {
  const { initialize } = useBranchStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null; // This component doesn't render anything
}
