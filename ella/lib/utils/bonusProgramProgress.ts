import { BonusProgram, LoyaltyCard, ProgramUserProgress, ProgramType } from '@/types/bonus';

const POINTS_BASED_TYPES: ProgramType[] = ['points', 'spend_based', 'tiered'];

function isPointsBased(program: BonusProgram): boolean {
  return program.programType ? POINTS_BASED_TYPES.includes(program.programType) : false;
}

function findCardForProgram(program: BonusProgram, cards: LoyaltyCard[]): LoyaltyCard | undefined {
  const programId = String(program.id);
  const programCard = cards.find(
    (card) => card.bonusProgramId !== undefined && String(card.bonusProgramId) === programId,
  );
  if (programCard) {
    return programCard;
  }

  const businessCards = cards.filter((card) => !card.bonusProgramId);
  if (businessCards.length === 1) {
    return businessCards[0];
  }

  return undefined;
}

export function getProgramUserProgress(
  program: BonusProgram,
  cards: LoyaltyCard[],
): ProgramUserProgress | undefined {
  const card = findCardForProgram(program, cards);
  if (!card) {
    return undefined;
  }

  if (isPointsBased(program)) {
    const required = program.pointsRequired || card.stampsRequired;
    if (required <= 0) {
      return undefined;
    }
    return {
      current: card.points ?? 0,
      required,
      type: 'points',
    };
  }

  const required = card.stampsRequired || program.pointsRequired;
  if (required <= 0) {
    return undefined;
  }

  return {
    current: card.stamps ?? 0,
    required,
    type: 'stamps',
  };
}

export function attachUserProgressToPrograms(
  programs: BonusProgram[],
  cards: LoyaltyCard[],
): BonusProgram[] {
  return programs.map((program) => {
    const userProgress = getProgramUserProgress(program, cards);
    return userProgress ? { ...program, userProgress } : program;
  });
}
