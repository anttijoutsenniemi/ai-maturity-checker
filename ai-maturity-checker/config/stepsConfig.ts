export interface StepConfig {
    id: number;
    title: string;
    href: string;
  }
  
  export const stepsConfig: StepConfig[] = [
    { id: 1, title: "Answer assessment questions", href: "/test"},
    { id: 2, title: "Set your priorities", href: "/test2"},
    { id: 3, title: "Follow guides to level up", href: "/test3"},
    { id: 4, title: "Reassess", href: "/test4"},
  ];