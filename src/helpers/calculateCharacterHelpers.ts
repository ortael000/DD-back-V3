import { CharacterBasetype, EquipmentType, WeaponBaseType, SkillBaseType, PassiveType, CharacterFulltype, EquipmentDisplayed, PassiveDisplayed, SkillDisplayed} from '../types/character.js';
import { Characteristic } from '../types/stringLists.js'; 
import {AllBonusKeys} from '../types/stringListsAsArray.js';
import { safeNumber,dbGet } from './diverse.js';
import {emptyEquipmentBase, emptyWeaponBase, emptyPassiveBase, emptySkillBase } from '../types/initialObject.js';

export async function calculateCharacterFull(db: any, id: number): Promise<CharacterFulltype> {
  // 1. Fetch all necessary data
  const base = await getCharacterBase(db, id);
  if (!base) {
    throw new Error(`Character with ID ${id} not found`);
  }

  const equipmentsObject = await getEquipments(db, base);
  const weaponsObject = await getWeapons(db, base);
  const passivesObject = await getPassives(db, base);
  const skillsObject = await getSkills(db, base);

  const equipments: EquipmentType[] = Object.values(equipmentsObject);
  const weapons: WeaponBaseType[] = Object.values(weaponsObject);
  const passives: PassiveType[] = Object.values(passivesObject);
  const skills: SkillBaseType[] = Object.values(skillsObject);


  // console.log("base", base);
  console.log("equipment", equipments);
  console.log("weapons", weapons);
  // console.log("passives", passives);
  // console.log("skills", skills);

  const flatBonus = calculateFlatBonus(base, equipments, passives); // 3.3 Flat-bonus aggregator (equip + passive)

  // 2. Calculate derived attributes
  const levelInfo = findCharacterLevel(base.XpPoint);

  const fullCharacteristics : CharacterFulltype['Characteristics']= {
      Strength: calculateCharacteristicBonus('Strength', base.Strength, base.TempStrength, equipments, weapons, passives),
      Intelligence: calculateCharacteristicBonus('Intelligence', base.Intelligence, base.TempIntelligence, equipments, weapons, passives),
      Constitution: calculateCharacteristicBonus('Constitution', base.Constitution, base.TempConstitution, equipments, weapons, passives),
      Charisma: calculateCharacteristicBonus('Charisma', base.Charisma, base.TempCharisma, equipments, weapons, passives),
      Dexterity: calculateCharacteristicBonus('Dexterity', base.Dexterity, base.TempDexterity, equipments, weapons, passives),
      Agility: calculateCharacteristicBonus('Agility', base.Agility, base.TempAgility, equipments, weapons, passives),
      Perception: calculateCharacteristicBonus('Perception', base.Perception, base.TempPerception, equipments, weapons, passives),
      Power: calculateCharacteristicBonus('Power', base.Power, base.TempPower, equipments, weapons, passives),
    }

    const maxHP = 10 + fullCharacteristics.Constitution.Modifier * 4  + fullCharacteristics.Strength.Modifier  + findCharacterLevel(base.XpPoint).level * 2 + flatBonus.HitPoint;
    const maxMana = 12 + fullCharacteristics.Power.Modifier * 6 + fullCharacteristics.Intelligence.Modifier + fullCharacteristics.Constitution.Modifier*2+ levelInfo.level * 2 + flatBonus.Mana;
    const maxMovement = 5 + fullCharacteristics.Agility.Modifier +  flatBonus.Movement;
    const fullWeapons = calculateWeaponFull(weapons, fullCharacteristics, equipments, passives);
    const initiative = Math.floor(fullCharacteristics.Perception.Modifier/3 + fullCharacteristics.Agility.Modifier/4) + flatBonus.Initiative;

    const fullCharacter : CharacterFulltype  = {
        General: {
            Id: base.id,
            Name: base.Name,
            XpPoint: base.XpPoint,
            Level: findCharacterLevel(base.XpPoint).level,
            XpToNextLevel: findCharacterLevel(base.XpPoint).xpNeeded,
            HitPoint: maxHP,
            Mana: maxMana,
            Initiative: initiative,
            Movement: maxMovement,
            CurrentHPLose: base.currentHPLose,
            CurrentManaLose: base.currentManaLose,
            CurrentMoney: base.currentMoney
        },

        Defenses: {
          DefenseRange: 20 + flatBonus.DefenseRange + Math.floor(fullCharacteristics.Agility.Modifier/2 + fullCharacteristics.Perception.Modifier/2),
          DefenseMelee: 20 + flatBonus.DefenseMelee + Math.floor(fullCharacteristics.Dexterity.Modifier/2 + fullCharacteristics.Agility.Modifier/2),
          ResPhysical: flatBonus.ResPhysical + Math.floor(fullCharacteristics.Constitution.Modifier/2),
          ResChi: flatBonus.ResChi,
          ResFire: flatBonus.ResFire,
          ResLightning: flatBonus.ResLightning,
          ResMental: flatBonus.ResMental + Math.floor(fullCharacteristics.Charisma.Modifier/2),
          ResIce: flatBonus.ResIce,
        },

        Characteristics: fullCharacteristics,

        Knowledge: {
            Stealth: base.Stealth + flatBonus.Stealth,
            Medecine: base.Medecine + flatBonus.Medecine,
            Forge: base.Forge + flatBonus.Forge,
            Magic: base.Magic + flatBonus.Magic,
            Demonic: base.Demonic + flatBonus.Demonic,
            Cooking: base.Cooking + flatBonus.Cooking,
            Nature: base.Nature + flatBonus.Nature,
            Martial: base.Martial + flatBonus.Martial,
        }, 
        Weapon1: fullWeapons[0],
        Weapon2: fullWeapons[1],
        Weapon3: fullWeapons[2],

        Skill1: calculateSkillFull(skills[0], fullCharacteristics, equipments, passives),
        Skill2: calculateSkillFull(skills[1], fullCharacteristics, equipments, passives),
        Skill3: calculateSkillFull(skills[2], fullCharacteristics, equipments, passives),
        Skill4: calculateSkillFull(skills[3], fullCharacteristics, equipments, passives),
        Skill5: calculateSkillFull(skills[4], fullCharacteristics, equipments, passives),
        Skill6: calculateSkillFull(skills[5], fullCharacteristics, equipments, passives),

        Equipment: {
            Helmet: transformEquipment(equipments.find(e => e.id === base.equipmentHelmetID)),
            Armor: transformEquipment(equipments.find(e => e.id === base.equipmentArmorID)),
            Belt: transformEquipment(equipments.find(e => e.id === base.equipmentBeltID)),
            Gauntlet: transformEquipment(equipments.find(e => e.id === base.equipmentGauntletID)),
            Boots: transformEquipment(equipments.find(e => e.id === base.equipmentBootsID)),
            Ring1: transformEquipment(equipments.find(e => e.id === base.equipmentRing1ID)),
            Ring2: transformEquipment(equipments.find(e => e.id === base.equipmentRing2ID)),
            Necklace: transformEquipment(equipments.find(e => e.id === base.equipmentNecklaceID)),
            Shield: transformEquipment(equipments.find(e => e.id === base.equipmentShieldID)),
        },

        Passive : {
            passive1: passives[0],
            passive2: passives[1],
            passive3: passives[2],
            passive4: passives[3],
        }       
    }

    return fullCharacter;
}

async function getCharacterBase(db: any, id: number) {
  return dbGet<CharacterBasetype>(db, `charactersBase`, id);
}

async function getEquipments(db: any, base: CharacterBasetype) {
  return {
    equipmentHelmetID:   (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentHelmetID))   ?? emptyEquipmentBase,
    equipmentArmorID:    (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentArmorID))    ?? emptyEquipmentBase,
    equipmentPantsID:    (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentPantsID))    ?? emptyEquipmentBase,
    equipmentBeltID:     (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentBeltID))     ?? emptyEquipmentBase,
    equipmentGauntletID: (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentGauntletID)) ?? emptyEquipmentBase,
    equipmentBootsID:    (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentBootsID))    ?? emptyEquipmentBase,
    equipmentRing1ID:    (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentRing1ID))    ?? emptyEquipmentBase,
    equipmentRing2ID:    (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentRing2ID))    ?? emptyEquipmentBase,
    equipmentNecklaceID: (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentNecklaceID)) ?? emptyEquipmentBase,
    equipmentShieldID:   (await dbGet<EquipmentType>(db, "equipmentsBase", base.equipmentShieldID))   ?? emptyEquipmentBase,
  };
}

async function getWeapons(db: any, base: CharacterBasetype) {
  return {
    Weapon1ID: (await dbGet<WeaponBaseType>(db, "weaponsBase", base.Weapon1ID)) ?? emptyWeaponBase,
    Weapon2ID: (await dbGet<WeaponBaseType>(db, "weaponsBase", base.Weapon2ID)) ?? emptyWeaponBase,
    Weapon3ID: (await dbGet<WeaponBaseType>(db, "weaponsBase", base.Weapon3ID)) ?? emptyWeaponBase,
  };
}
      
async function getPassives(db: any, base: CharacterBasetype) {
  return {
    passive1ID: (await dbGet<PassiveType>(db, "passivesBase", base.passive1ID)) ?? emptyPassiveBase,
    passive2ID: (await dbGet<PassiveType>(db, "passivesBase", base.passive2ID)) ?? emptyPassiveBase,
    passive3ID: (await dbGet<PassiveType>(db, "passivesBase", base.passive3ID)) ?? emptyPassiveBase,
    passive4ID: (await dbGet<PassiveType>(db, "passivesBase", base.passive4ID)) ?? emptyPassiveBase,
  };
}

async function getSkills(db: any, base: CharacterBasetype) {
  return {
    skill1ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill1ID)) ?? emptySkillBase,
    skill2ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill2ID)) ?? emptySkillBase,
    skill3ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill3ID)) ?? emptySkillBase,
    skill4ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill4ID)) ?? emptySkillBase,
    skill5ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill5ID)) ?? emptySkillBase,
    skill6ID: (await dbGet<SkillBaseType>(db, "skillsBase", base.skill6ID)) ?? emptySkillBase,
  };
}

// 3.1 Character level & XP to next (exact same loop) :contentReference[oaicite:5]{index=5}
function findCharacterLevel(xpPoint: number): { level: number; xpNeeded: number } {
  let totalxpNeeded = 400;
  let level = 1;
  while (totalxpNeeded < xpPoint) {
    const nextLevelXp = 300 * level + 100 * (level ** 2);
    totalxpNeeded += nextLevelXp;
    level++;
  }
  return { level, xpNeeded: totalxpNeeded - xpPoint };
}

function calculateCharacteristicBonus (charac : Characteristic, basecharacter: number, temporary: number, equipments : EquipmentType[], weapons: WeaponBaseType[], passives: PassiveType[]) {

    let equipmentBonus = 0;
    let passiveBonus = 0;

    equipments.forEach(equipment => {
        if (equipment[charac] !== undefined) {
            equipmentBonus += equipment[charac];
        }
    });


    passives.forEach(passiveSkill => {
        if (passiveSkill[charac] !== undefined) {
            passiveBonus += passiveSkill[charac];
        }
    });

    return {
      Base: basecharacter,
      Equipment: equipmentBonus,
      Passive: passiveBonus,
      Temporary: temporary,
      Total: basecharacter + equipmentBonus + passiveBonus + temporary,
      Modifier: Math.floor((basecharacter + equipmentBonus + passiveBonus + temporary - 10) / 2)
      };
} 

// 3.2 Flat-bonus aggregator (equip + passive) :contentReference[oaicite:6]{index=6}
function calculateFlatBonus( base: CharacterBasetype, equipments: EquipmentType[], passives: PassiveType[]): Record<string, number> {

  const allBonusValue = AllBonusKeys.reduce((acc, key) => {
    // Helper to check if a value is numeric
    const safeNumber = (val: any): number => (typeof val === 'number' && !isNaN(val) ? val : 0);

    const baseValue = safeNumber(base[key as keyof CharacterBasetype]);
    const eq = equipments.reduce((sum, e) => sum + safeNumber(e[key as keyof EquipmentType]), 0);
    const ps = passives.reduce((sum, p) => sum + safeNumber(p[key as keyof PassiveType]), 0);

    acc[key] = baseValue + eq + ps;   // add the new key with its total value as a property of the accumulator object
    return acc;
  }, {} as Record<string, number>);

  return allBonusValue;
}

// 3.4 Weapon-type bonus from equip/passives (damage + precision) :contentReference[oaicite:8]{index=8}
function findWeaponBonus(weaponType: any, equipments: EquipmentType[], passives: PassiveType[]) {
  let DamBonus = 0, PrecisionBonus = 0;
  equipments.forEach(equipment => { if (equipment.WeaponType === weaponType) { DamBonus += equipment.WeaponDamageBonus; PrecisionBonus += equipment.WeaponPrecisionBonus; }});
  passives.forEach(passive =>   { if (passive.WeaponType === weaponType) { DamBonus += passive.WeaponDamageBonus; PrecisionBonus += passive.WeaponPrecisionBonus; }});
  return { DamBonus, PrecisionBonus };
}

function findElementBonus (element: string, equipments : EquipmentType[], passives: PassiveType[]) : number {
    
    let damBonus = 0;
    const key = `Dam${element}` as keyof EquipmentType;
    const key2 = `Dam${element}` as keyof PassiveType;

    equipments.forEach(equipment => {
        if (equipment[key] !== undefined && typeof equipment[key] === "number") {
            const bonus = equipment[key];
            if (typeof bonus === "number"){
                damBonus += bonus;
            }
        }
    }); 

    passives.forEach(passiveSkill => {
        if (passiveSkill[key2] !== undefined && typeof passiveSkill[key2] === "number") {
            const bonus = passiveSkill[key2];
            if (typeof bonus === "number"){
                damBonus += bonus;
            }
        }
    }); 

    return damBonus
}
export function transformEquipment(equipment: EquipmentType | undefined): EquipmentDisplayed {
  // 1. Extract the two groups of stats
  if (!equipment) {
    return {
      ID: 1,
      Name: 'None',
      Subtype: 'None',
      Value: 0,
      DefensiveStats: {
        DefenseRange: 0,
        DefenseMelee: 0,
        ResPhysical: 0,
      },
      Characteristics: {
        Strength: 0,
        Intelligence: 0,
        Constitution: 0,
        Charisma: 0,
        Dexterity: 0,
        Agility: 0,
        Perception: 0,
        Power: 0,
      },
      positiveBonus: '',
      negativeBonus: '',
    };
  } else {
    const defensiveStats = {
      DefenseRange: equipment.DefenseRange,
      DefenseMelee: equipment.DefenseMelee,
      ResPhysical: equipment.ResPhysical,
    };

    const characteristics = {
      Strength: equipment.Strength,
      Intelligence: equipment.Intelligence,
      Constitution: equipment.Constitution,
      Charisma: equipment.Charisma,
      Dexterity: equipment.Dexterity,
      Agility: equipment.Agility,
      Perception: equipment.Perception,
      Power: equipment.Power,
    };

    // 2. Collect all numeric bonuses outside the two main groups
    const defensiveKeys = new Set<keyof typeof defensiveStats>([
      'DefenseRange',
      'DefenseMelee',
      'ResPhysical',
    ]);

    const characteristicKeys = new Set<keyof typeof characteristics>([
      'Strength',
      'Intelligence',
      'Constitution',
      'Charisma',
      'Dexterity',
      'Agility',
      'Perception',
      'Power',
    ]);

    const positives: string[] = [];
    const negatives: string[] = [];

    for (const [key, rawVal] of Object.entries(equipment)) {
      // skip non-numbers and the Name / OtherEffect
      if (typeof rawVal !== 'number') continue;
      // skip the stats we've already grouped
      if (key === 'id') continue;
      if (key === 'Value') continue;
      if (
        defensiveKeys.has(key as any) ||
        characteristicKeys.has(key as any)
      ) {
        continue;
      }

      // we have a “bonus” field
      const val = rawVal as number;
      const formatted = `${key}: ${val >= 0 ? '+' + val : val}`;

      if (val > 0) {
        positives.push(formatted);
      } else if (val < 0) {
        negatives.push(formatted);
      }
      // zero would be omitted
    }

    return {
      ID : equipment.id,
      Subtype: equipment.Subtype,
      Name: equipment.Name,
      Value: equipment.Value,

      DefensiveStats: defensiveStats,
      Characteristics: characteristics,

      positiveBonus: positives.join(', '),
      negativeBonus: negatives.join(', '),
    };
  }

}

export function transformPassive(passive: PassiveType): PassiveDisplayed {

  const characteristics = {
    Strength: passive.Strength,
    Intelligence: passive.Intelligence,
    Constitution: passive.Constitution,
    Charisma: passive.Charisma,
    Dexterity: passive.Dexterity,
    Agility: passive.Agility,
    Perception: passive.Perception,
    Power: passive.Power,
  };

  const characteristicKeys = new Set<keyof typeof characteristics>([
    'Strength',
    'Intelligence',
    'Constitution',
    'Charisma',
    'Dexterity',
    'Agility',
    'Perception',
    'Power',
  ]);

  const positives: string[] = [];
  const negatives: string[] = [];

  for (const [key, rawVal] of Object.entries(passive)) {

    let toBePutInText = true
    // skip non-numbers and the Name / OtherEffect
    // if (typeof rawVal !== 'number') toBePutInText = false;
    // skip the stats we've already grouped
    if (key === 'id' ) toBePutInText = false;
    if (key === 'LevelRequired') toBePutInText = false;
    if (key === 'OtherEffect') toBePutInText = false;
    if (key === 'ParentPassive') toBePutInText = false;
    if (key === 'PassiveLevel') toBePutInText = false;
    if (key === 'Value') toBePutInText = false;
    if (characteristicKeys.has(key as any)) {
      toBePutInText = false;
    }

    // we have a “bonus” field
    const val = rawVal as number;
    const formatted = `${key}: ${val >= 0 ? '+' + val : val}`;

    if (toBePutInText) {
      if (val > 0) {
        positives.push(formatted);
      } else if (val < 0) {
        negatives.push(formatted);
      }
    }
    // zero would be omitted
  }

  return {
    Name: passive.Name,
    Id: passive.id,
    PassiveLevel: passive.PassiveLevel,

    Characteristics: characteristics,

    positiveBonus: positives.join(', '),
    negativeBonus: negatives.join(', '),
  }

}

function calculateWeaponFull(weapons: WeaponBaseType[], fullCharacteristics: CharacterFulltype['Characteristics'], equipments : EquipmentType[], passives: PassiveType[]) : CharacterFulltype['Weapon1'][] {
    
    let weaponsFull: CharacterFulltype['Weapon1'][] = [];

    for (let i = 0; i < weapons.length; i++) {
    const weapon = weapons[i];
    const weaponBonus = findWeaponBonus(weapon.Type, equipments, passives);

    let minDam = weapon.BaseMinDam + (fullCharacteristics[weapon.StatDam1].Modifier + fullCharacteristics[weapon.StatDam2].Modifier + weaponBonus.DamBonus)*weapon.MinDamRatio/2;
    let maxDam = weapon.BaseMaxDam + (fullCharacteristics[weapon.StatDam1].Modifier + fullCharacteristics[weapon.StatDam2].Modifier + weaponBonus.DamBonus)*weapon.MaxDamRatio/2;
    
    let precision = weapon.BasePrecision + (fullCharacteristics[weapon.StatPrecision1].Modifier + fullCharacteristics[weapon.StatPrecision2].Modifier)*weapon.PrecisionRatio/2 + weaponBonus.PrecisionBonus;

    if (i === 0 && weapons[1].id !== 1 && weapons[0].id !== 1) {
      precision -= 4;
    }

    if (i === 1 && weapons[0].id !== 1 && weapons[1].id !== 1) {
      precision -= 4;
    }

    const weaponFull : CharacterFulltype['Weapon1']= {
        id: weapon.id,
        Name: weapon.Name,
        type: weapon.Type,
        subtype: weapon.Subtype,
        element: weapon.Element,
        minDamage: Math.floor(minDam),
        maxDamage: Math.floor(maxDam),
        precision: Math.floor(precision),
        critical: weapon.CriticScore,
        OtherEffects: weapon.OtherEffects,
    }
    weaponsFull.push(weaponFull);

  }
    return weaponsFull
}

function calculateSkillFull(skill: SkillBaseType, fullCharacteristics: CharacterFulltype['Characteristics'], equipments : EquipmentType[], passives: PassiveType[]) : CharacterFulltype['Skill1'] {

    const elementBonus = findElementBonus(skill.Element, equipments, passives);

    let minDam = skill.BaseMinDam + (safeNumber(fullCharacteristics[skill.StatDam1].Modifier) + safeNumber(fullCharacteristics[skill.StatDam2].Modifier) + safeNumber(elementBonus))*skill.MinDamRatio/2;
    let maxDam = skill.BaseMaxDam + (safeNumber(fullCharacteristics[skill.StatDam1].Modifier) + safeNumber(fullCharacteristics[skill.StatDam2].Modifier) + safeNumber(elementBonus))*skill.MaxDamRatio/2;

    let precision = skill.BasePrecision + (safeNumber(fullCharacteristics[skill.StatPrecision1].Modifier) + safeNumber(fullCharacteristics[skill.StatPrecision2].Modifier))*skill.PrecisionRatio/2;

    const skillFull : SkillDisplayed= {

        name: skill.Name,
        type: skill.Type,
        Id: skill.id,
        skillLevel: skill.SkillLevel,
        element: skill.Element,
        manaCost: Math.floor (skill.ManaCost+(fullCharacteristics[skill.StatDam1].Modifier + fullCharacteristics[skill.StatDam2].Modifier)*skill.ManaCostRatio/2),
        minDamage: Math.floor(minDam),
        maxDamage: Math.floor(maxDam),
        precision: Math.floor(precision),
        critical: skill.CriticScore,
        additionalEffect: skill.OtherEffects,
    }

    return skillFull
}



