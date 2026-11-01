export interface Program {
  id: string;
  title: string;
  stage: string;
  focus: string;
  description: string;
  cta: string;
  doctorVerified: boolean;
}

export type ProgramResponse = Program;
