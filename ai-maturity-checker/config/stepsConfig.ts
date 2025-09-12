export interface StepConfig {
    id: number;
    title: string;
    href: string;
  }
  
  export const stepsConfig: StepConfig[] = [
    { id: 1, title: "Answer assessment questions", href: "/questions"},
    { id: 2, title: "Follow your progress answering questions", href: "/progress"},
    { id: 3, title: "Set your priority dimensions", href: "/results"},
    { id: 4, title: "Analysis & Planning", href: "/profile"},
    { id: 5, title: "Reassess", href: "/roadmap"},
  ];