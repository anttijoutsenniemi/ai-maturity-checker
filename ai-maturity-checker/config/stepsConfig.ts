export interface StepConfig {
    id: number;
    title: string;
    href: string;
  }
  
  export const stepsConfig: StepConfig[] = [
    { id: 1, title: "Answer assessment questions", href: "/questions"},
    { id: 2, title: "Set your priority dimensions", href: "/results"},
    { id: 3, title: "Analysis & Planning", href: "/profile"},
    { id: 4, title: "Get recommendations", href: "/recommendations"},
    // { id: 5, title: "Reassess", href: "/roadmap"},
  ];