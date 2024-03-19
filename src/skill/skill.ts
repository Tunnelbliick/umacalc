export interface skill {
  skillid: number;
  requirements: skill_requirements[];
  effect: skill_effect[];
  duration: number;
}

export enum requirements {
  running_style,
}

export enum effects {
  inc_target_speed,
}

export interface skill_effect {
  effect: effects;
  value: number;
}

export interface skill_requirements {
  required: boolean;
  requirement: requirements;
  value: number;
}
