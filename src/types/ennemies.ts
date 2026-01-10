import { Element, Race } from "./stringLists";


export type SkillType = "Melee" | "Range";

export interface Enemy {
  Name: string;
  Race: Race;
  Description?: string;
  Xp: number;
  HitPoint: number;
  Mana: number;
  DefenseRange: number;
  DefenseMelee: number;
  ResPhysical: number;
  ResChi: number;
  ResFire: number;
  ResLightning: number;
  ResIce: number;
  ResMental: number;
  Skill1Name: string;
  Skill1Cost: number;
  Skill1Element: Element;
  Skill1Type: SkillType;
  Skill1TouchChance: number;
  Skill1MinDamage: number;
  Skill1MaxDamage: number;
  Skill1OtherEffect: string;
  Skill2Name: string;
  Skill2Cost: number;
  Skill2Element: Element;
  Skill2Type: SkillType;
  Skill2TouchChance: number;
  Skill2MinDamage: number;
  Skill2MaxDamage: number;
  Skill2OtherEffect: string;
  Skill3Name: string;
  Skill3Cost: number;
  Skill3Element: Element;
  Skill3Type: SkillType;
  Skill3TouchChance: number;
  Skill3MinDamage: number;
  Skill3MaxDamage: number;
  Skill3OtherEffect: string;
  LootType: number;
  LootTypeName: string;
  LootValue: number;
}

export interface Loot {
  LootTypeName: string;
  ObjectType: string;
  ObjectID: number;
  ObjectName: string;
  chance: number;
}