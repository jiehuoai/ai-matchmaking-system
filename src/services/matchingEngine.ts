import { UserProfile, PersonalityProfile } from '../types/personality';

export class MatchingEngine {
  private calculateBaseCompatibility(user1: UserProfile, user2: UserProfile): number {
    // Check basic criteria (age, location, deal-breakers)
    const ageGap = Math.abs(user1.age - user2.age);
    const distance = this.calculateDistance(user1.location.coordinates, user2.location.coordinates);
    
    // Deal breakers check
    const hasConflictingDealBreakers = user1.dealBreakers.some(
      dealBreaker => user2.dealBreakers.includes(dealBreaker)
    );

    if (hasConflictingDealBreakers) return 0;

    return this.normalizeScore(ageGap, distance);
  }

  private calculatePersonalityCompatibility(
    profile1: PersonalityProfile,
    profile2: PersonalityProfile
  ): number {
    // Add dynamic weighting based on confidence scores
    const weights = {
      mbti: profile1.confidenceScores.mbti * profile2.confidenceScores.mbti,
      bigFive: profile1.confidenceScores.bigFive * profile2.confidenceScores.bigFive,
      values: profile1.confidenceScores.values * profile2.confidenceScores.values
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    
    return (
      (this.calculateMBTICompatibility(profile1.mbti, profile2.mbti) * weights.mbti +
      this.calculateBigFiveCompatibility(profile1.bigFive, profile2.bigFive) * weights.bigFive +
      this.calculateValuesCompatibility(profile1.values, profile2.values) * weights.values) 
      / totalWeight
    );
  }

  private predictConflictAreas(user1: UserProfile, user2: UserProfile): {
    riskAreas: string[];
    riskLevel: number;
    mitigationStrategies: string[];
  } {
    const riskAreas = [];
    const strategies = [];
    let totalRisk = 0;

    // Analyze value differences
    const valueDiffs = this.analyzeValueDifferences(user1.values, user2.values);
    if (valueDiffs.significant) {
      riskAreas.push('value_conflict');
      strategies.push('Focus on shared experiences rather than philosophical discussions initially');
      totalRisk += valueDiffs.riskScore;
    }

    // Analyze lifestyle compatibility
    const lifestyleConflicts = this.analyzeLifestyleConflicts(user1, user2);
    if (lifestyleConflicts.length > 0) {
      riskAreas.push(...lifestyleConflicts);
      strategies.push('Discuss expectations and boundaries early');
      totalRisk += lifestyleConflicts.length * 0.1;
    }

    return {
      riskAreas,
      riskLevel: totalRisk,
      mitigationStrategies: strategies
    };
  }

  generateConversationStarters(user1: UserProfile, user2: UserProfile): string[] {
    const starters = [];
    
    // Find common interests
    const commonInterests = user1.interests.filter(
      interest => user2.interests.includes(interest)
    );
    
    if (commonInterests.length > 0) {
      starters.push(`I noticed you're also interested in ${commonInterests[0]}!`);
    }

    // Generate personality-based starters
    if (user1.mbti.type[0] === 'E' && user2.mbti.type[0] === 'I') {
      starters.push("What's your ideal way to recharge after a busy week?");
    }

    return starters;
  }

  async findMatches(user: UserProfile, candidates: UserProfile[]): Promise<{
    matches: Array<{
      profile: UserProfile;
      compatibilityScore: number;
      uniqueConnections: string[];
      conversationStarters: string[];
      riskAnalysis: {
        riskAreas: string[];
        riskLevel: number;
        mitigationStrategies: string[];
      };
    }>;
  }> {
    const matches = await Promise.all(
      candidates.map(async (candidate) => {
        const baseCompat = this.calculateBaseCompatibility(user, candidate);
        if (baseCompat === 0) return null;

        const personalityCompat = this.calculatePersonalityCompatibility(user, candidate);
        const riskAnalysis = this.predictConflictAreas(user, candidate);
        
        return {
          profile: candidate,
          compatibilityScore: (baseCompat * 0.3) + (personalityCompat * 0.7),
          uniqueConnections: this.findUniqueConnections(user, candidate),
          conversationStarters: this.generateConversationStarters(user, candidate),
          riskAnalysis
        };
      })
    );

    return {
      matches: matches.filter(Boolean).sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      )
    };
  }

  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    // Haversine formula implementation
    return 0; // Simplified for example
  }

  private normalizeScore(ageGap: number, distance: number): number {
    // Normalize and combine scores
    return 0.5; // Simplified for example
  }

  private findUniqueConnections(user1: UserProfile, user2: UserProfile): string[] {
    // Find unexpected but meaningful connections
    return ['Complementary communication styles', 'Shared unusual interests'];
  }

  private calculateMBTICompatibility(mbti1: any, mbti2: any): number {
    return 0.5; // Simplified implementation
  }

  private calculateBigFiveCompatibility(bf1: any, bf2: any): number {
    return 0.5; // Simplified implementation
  }

  private calculateValuesCompatibility(v1: any, v2: any): number {
    return 0.5; // Simplified implementation
  }

  private analyzeValueDifferences(v1: any, v2: any): { significant: boolean; riskScore: number } {
    return { significant: true, riskScore: 0.3 }; // Simplified implementation
  }

  private analyzeLifestyleConflicts(user1: UserProfile, user2: UserProfile): string[] {
    return ['schedule_conflict']; // Simplified implementation
  }
}