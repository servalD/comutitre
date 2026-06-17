import { Injectable } from '@nestjs/common';
import { Profile } from '../../domain/enums/profile.enum';

@Injectable()
export class ProfileCalculatorService {
  calculateFromBirthDate(birthDate: Date): Profile {
    const age = this.calculateAge(birthDate);

    if (age < 11) {
      return Profile.JUNIOR;
    }
    if (age < 18) {
      return Profile.SCOLAIRE;
    }
    if (age < 26) {
      return Profile.ETUDIANT;
    }
    if (age >= 62) {
      return Profile.SENIOR;
    }
    return Profile.ADULTE;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }
    return age;
  }
}
