
export type View = 'dashboard' | 'calorie' | 'meal' | 'water' | 'bmi' | 'activity' | 'chat' | 'profile' | 'emergency' | 'insights' | 'strategy';

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
}

export interface Meal {
    title: string;
    description: string;
    substitutions?: string[];
    nutrition: NutritionInfo;
}

export interface CalorieAnalysis {
    totalCalories: number;
    foods: string;
}

export interface BMIHistoryEntry {
    bmi: number;
    interpretation: string;
    weight: number;
    height: number;
    date: string;
}

export interface ActivityHistoryEntry {
    distance: number;
    duration: number;
    date: string;
    path: [number, number][];
    calories?: number;
    avgPace?: string;
    type?: string;
}

// Daily Check-in Data
export interface DailyLog {
    date: string;
    sleepHours: number;
    sleepQuality: 'Bom' | 'Médio' | 'Ruim';
    mood: 'Feliz' | 'Ansioso' | 'Estressado' | 'Desanimado' | 'Neutro';
    energyLevel: 'Alto' | 'Médio' | 'Baixo';
    menstrualDay?: number; // 1-28
    didWorkoutYesterday: boolean;
    dietComplianceYesterday: 'Segui 100%' | 'Deslize leve' | 'Chutei o balde';
}

// The Dynamic Strategy Output
export interface DailyStrategy {
    date: string;
    focusOfTheDay: string; // "Recuperação", "Foco Total", "Controle de Ansiedade"
    nutritionAdjustment: {
        action: 'Manter' | 'Reduzir Calorias' | 'Aumentar Carboidratos' | 'Aumentar Proteína' | 'Hidratação Forçada';
        reason: string;
        caloriesTarget: number;
    };
    workoutSuggestion: {
        type: 'Treino Original' | 'HIIT Rápido' | 'Yoga/Alongamento' | 'Caminhada Leve' | 'Descanso Total';
        duration: string;
        reason: string;
    };
    smartTip: string; // Behavioral advice
    moodHack: string; // "Respiração 4-7-8", "Caminhada no sol", etc.
}

// Onboarding 2.0 fields
export interface UserProfile {
    name: string;
    email: string;
    
    // 1. Sobre você
    goal?: 'Emagrecer' | 'Definir' | 'Saúde';
    age?: number;
    sex?: 'male' | 'female' | 'other'; 
    height?: number; // in cm
    weight?: number; // in kg
    goalWeight?: number; // in kg
    
    // 2. Alimentação
    dietQuality?: 'Boa' | 'Média' | 'Ruim';
    dietaryRestrictions?: string; 
    emotionalEating?: boolean;

    // 3. Atividade Física
    currentlyTraining?: boolean;
    trainingDays?: number; // 1-7
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

    // 4. Rotina
    sleepQuality?: 'Bom' | 'Médio' | 'Ruim';
    stressLevel?: 'Baixo' | 'Médio' | 'Alto';

    // 5. Preferências
    mealPrepPreference?: 'Rápidas' | 'Elaboradas';
    cookingHabit?: 'Cozinho' | 'Como fora';

    // 6. Compromisso
    motivationLevel?: 'Baixo' | 'Médio' | 'Alto';
    willingToTrack?: boolean;
    
    // Women's Health
    tracksPeriod?: boolean;
    lastPeriodDate?: string;
    cycleLength?: number;

    // Campos legados ou auxiliares
    saboteurs?: string[];
    dietaryPreference?: string; 
    dietHistory?: string;

    // Gamificação
    points: number;
    level: number;
    streakDays: number;
    
    // Assinatura
    subscriptionStatus: 'free_trial' | 'active' | 'expired';
    trialEndDate?: string; 
    subscriptionEndDate?: string; 
}

export interface PersonalizedPlan {
    dailyCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    mealPlan: Meal[];
    exerciseRoutine: string[];
    aiTips: string[]; 
}

export interface CurrentWeather {
    temperature: number;
    weathercode: number;
    windspeed: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface Insight {
    id: string;
    type: 'pattern' | 'warning' | 'achievement';
    category: 'sleep' | 'diet' | 'stress' | 'activity';
    title: string;
    description: string;
    recommendation: string;
}

// FitTrack Types
export interface FeedItem {
    id: string;
    user: string;
    userAvatar?: string;
    activityType: string;
    date: string;
    title: string;
    stats: {
        distance: string;
        time: string;
        elevation?: string;
    };
    likes: number;
    comments: number;
    mapImage?: string; // Placeholder for map snapshot
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
    daysLeft: number;
    image?: string;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    earnedDate?: string;
}
