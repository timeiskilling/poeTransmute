import { PoeNinjaCharacterApiResponse } from 'src/poe2/poe2NinjaDto/characterNinjaZodSchema';
import { InternalCharacterProfile } from '../models/InternalCharacterProfile';

export interface ICharacterAdapter {
  getNormalizedProfile(): InternalCharacterProfile;
}

export class PoeNinjaAdapter implements ICharacterAdapter {
  constructor(private readonly rawData: PoeNinjaCharacterApiResponse) {}

  public getNormalizedProfile(): InternalCharacterProfile {
    return {
      account: this.rawData.account,
      characterName: this.rawData.name,
      league: this.rawData.league,
      level: this.rawData.level,
      className: this.rawData.class,

      ehp: this.rawData.defensiveStats.effectiveHealthPool,
      life: this.rawData.defensiveStats.life,
      mana: this.rawData.defensiveStats.mana,
      energyShield: this.rawData.defensiveStats.energyShield,

      resistances: {
        fire: this.rawData.defensiveStats.fireResistance,
        cold: this.rawData.defensiveStats.coldResistance,
        lightning: this.rawData.defensiveStats.lightningResistance,
        chaos: this.rawData.defensiveStats.chaosResistance,
      },
      lowestMaxHitTaken: this.rawData.defensiveStats.lowestMaximumHitTaken,

      mainSkills: this.extractMainSkills(),
      completedQuestRewards: this.rawData.questStats || [],
      pobExportString: this.rawData.pathOfBuildingExport ?? undefined,
    };
  }

  private extractMainSkills() {
    const skills = [];
    for (const skillGroup of this.rawData.skills) {
      for (const dpsEntry of skillGroup.dps || []) {
        if (dpsEntry.dps > 0) {
          skills.push({
            name: dpsEntry.name,
            dps: Math.round(dpsEntry.dps),
          });
        }
      }
    }

    return skills.sort((a, b) => b.dps - a.dps);
  }
}
