import { database } from '../config/database';

export class NameGeneratorService {
  private nameDatabase: { [key: string]: string[] } = {
    boy: [
      'Liam', 'Noah', 'Oliver', 'William', 'Elijah', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
      'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo',
      'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew',
    ],
    girl: [
      'Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn',
      'Abigail', 'Emily', 'Ella', 'Elizabeth', 'Camila', 'Luna', 'Sofia', 'Avery', 'Mila', 'Aria',
      'Scarlett', 'Penelope', 'Layla', 'Chloe', 'Victoria', 'Madison', 'Eleanor', 'Grace', 'Nora', 'Riley',
    ],
    unisex: [
      'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River',
      'Rowan', 'Skylar', 'Phoenix', 'Blake', 'Cameron', 'Dakota', 'Finley', 'Hayden', 'Jamie', 'Kai',
    ],
  };

  async generateNames(
    gender?: string,
    origin?: string,
    meaning?: string,
    limit: number = 10
  ): Promise<string[]> {
    let names: string[] = [];

    if (gender) {
      const genderKey = gender.toLowerCase();
      if (this.nameDatabase[genderKey]) {
        names = [...this.nameDatabase[genderKey]];
      } else if (genderKey === 'unisex') {
        names = [...this.nameDatabase.unisex];
      }
    } else {
      // Combine all if no gender specified
      names = [
        ...this.nameDatabase.boy,
        ...this.nameDatabase.girl,
        ...this.nameDatabase.unisex,
      ];
    }

    // Shuffle and limit
    const shuffled = names.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  async searchNames(searchTerm: string, limit: number = 20): Promise<string[]> {
    const allNames = [
      ...this.nameDatabase.boy,
      ...this.nameDatabase.girl,
      ...this.nameDatabase.unisex,
    ];

    const matching = allNames.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matching.slice(0, limit);
  }

  async getPopularNames(gender?: string, limit: number = 10): Promise<string[]> {
    if (gender) {
      const genderKey = gender.toLowerCase();
      if (this.nameDatabase[genderKey]) {
        return this.nameDatabase[genderKey].slice(0, limit);
      }
    }

    // Return top names from all categories
    return [
      ...this.nameDatabase.boy.slice(0, Math.ceil(limit / 3)),
      ...this.nameDatabase.girl.slice(0, Math.ceil(limit / 3)),
      ...this.nameDatabase.unisex.slice(0, Math.ceil(limit / 3)),
    ];
  }
}
