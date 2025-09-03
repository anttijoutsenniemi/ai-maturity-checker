export interface StepConfig {
    id: number;
    title: string;
    href: string;
  }
  
  export const stepsConfig: StepConfig[] = [
    { id: 1, title: "Answer assessment questions", href: "/questions"},
    { id: 2, title: "Set your priorities", href: "/results"},
    { id: 3, title: "See your AI development profile", href: "/profile"},
    { id: 4, title: "Follow guides to level up", href: "/roadmap"},
    { id: 5, title: "Reassess", href: "/test4"},
  ];