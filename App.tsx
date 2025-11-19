
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import type { View, UserProfile, PersonalizedPlan } from './types';
import CalorieCounter from './components/CalorieCounter';
import MealPlanner from './components/MealPlanner';
import WaterTracker from './components/WaterTracker';
import BMICalculator from './components/BMICalculator';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import NutriChat from './components/NutriChat';
import FitTrack from './components/FitTrack';
import Insights from './components/Insights';
import StrategyView from './components/StrategyView';
import Spinner from './components/Spinner';
import SubscriptionGate from './components/SubscriptionGate';

import { CameraIcon, WaterDropIcon, RunningIcon, UserIcon, HomeIcon, BrainIcon } from './components/icons/Icons';

type AuthView = 'login' | 'register' | 'forgot';

const isSubscriptionActive = (userToCheck: UserProfile | null): boolean => {
    if (!userToCheck) return false;

    const now = new Date();
    const { subscriptionStatus, trialEndDate, subscriptionEndDate } = userToCheck;

    if (subscriptionStatus === 'free_trial' && trialEndDate) {
        return new Date(trialEndDate) > now;
    }
    if (subscriptionStatus === 'active' && subscriptionEndDate) {
        return new Date(subscriptionEndDate) > now;
    }
    return false;
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Supabase Session
  useEffect(() => {
    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user) {
                // Load Profile
                 const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profileData) {
                     const mappedUser: UserProfile = {
                        name: profileData.name,
                        email: profileData.email,
                        goal: profileData.goal,
                        age: profileData.age,
                        height: profileData.height,
                        weight: profileData.weight,
                        goalWeight: profileData.goal_weight,
                        sex: profileData.sex,
                        activityLevel: profileData.activity_level,
                        points: profileData.points,
                        level: profileData.level,
                        streakDays: profileData.streak_days,
                        subscriptionStatus: profileData.subscription_status,
                        trialEndDate: profileData.trial_end_date,
                        subscriptionEndDate: profileData.subscription_end_date,
                    };
                    setUser(mappedUser);
                    
                    // Check Onboarding status
                    if (!mappedUser.goal || !mappedUser.weight) {
                        setNeedsOnboarding(true);
                    }
                    
                    // Load Plan
                     const { data: planData } = await supabase
                        .from('plans')
                        .select('plan_data')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                    
                    if (planData) setPlan(planData.plan_data);
                }
            }
        } catch (e) {
            console.error("Session check failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    checkSession();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            setUser(null);
            setPlan(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdateUser = useCallback(async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    // Also update in DB
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            await supabase.from('profiles').update({
                weight: updatedUser.weight,
                goal_weight: updatedUser.goalWeight,
                height: updatedUser.height,
                age: updatedUser.age,
                activity_level: updatedUser.activityLevel,
                sex: updatedUser.sex
            }).eq('id', authUser.id);
        }
    } catch (e) {
        console.error("Error updating profile in DB", e);
    }
  }, []);

  const handleLoginSuccess = useCallback((loggedInUser: UserProfile, userPlan: PersonalizedPlan | null) => {
    setUser(loggedInUser);
    if (!loggedInUser.goal || !loggedInUser.weight) {
        setNeedsOnboarding(true);
    } else {
        if (userPlan) setPlan(userPlan);
        setNeedsOnboarding(false);
        setCurrentView('dashboard');
    }
  }, []);

  const handleRegisterSuccess = useCallback((registeredUser: UserProfile) => {
    setUser(registeredUser);
    setNeedsOnboarding(true);
  }, []);
  
  const handleOnboardingComplete = useCallback(async (completedPlan: PersonalizedPlan, fullUser: UserProfile) => {
     setUser(fullUser);
     setPlan(completedPlan);
     setNeedsOnboarding(false);
     setCurrentView('dashboard');
     
     // Save to DB
     try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
             // Update Profile
            await supabase.from('profiles').update({
                goal: fullUser.goal,
                age: fullUser.age,
                height: fullUser.height,
                weight: fullUser.weight,
                goal_weight: fullUser.goalWeight,
                sex: fullUser.sex,
                activity_level: fullUser.activityLevel
            }).eq('id', authUser.id);

            // Insert Plan
            await supabase.from('plans').insert({
                user_id: authUser.id,
                plan_data: completedPlan
            });
        }
     } catch (e) {
         console.error("Error saving onboarding data", e);
     }

  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPlan(null);
    setCurrentView('dashboard');
    setAuthView('login');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    const authProps = {
      onLoginSuccess: handleLoginSuccess,
      onRegisterSuccess: handleRegisterSuccess,
      switchTo: (view: AuthView) => setAuthView(view),
    };
    switch (authView) {
      case 'register':
        return <Register {...authProps} />;
      case 'forgot':
        return <ForgotPassword {...authProps} />;
      default:
        return <Login {...authProps} />;
    }
  }
  
  if (needsOnboarding) {
      return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }


  const renderView = () => {
    const subscriptionActive = isSubscriptionActive(user);
    const premiumProps = { onNavigate: () => setCurrentView('profile') };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} plan={plan} onNavigate={setCurrentView} />;
      case 'calorie':
        return subscriptionActive ? <CalorieCounter /> : <SubscriptionGate {...premiumProps} />;
      case 'meal':
        return subscriptionActive 
          ? <MealPlanner userProfile={user} userPlan={plan} onPlanGenerated={(p) => handleOnboardingComplete(p, user)} /> 
          : <SubscriptionGate {...premiumProps} />;
      case 'water':
        return <WaterTracker />;
      case 'bmi':
        return <BMICalculator />;
      case 'activity':
        return <FitTrack />; // Updated: FitTrack manages its own internal navigation
      case 'chat':
        return <NutriChat user={user} initialMode='normal' />;
      case 'emergency':
         return <NutriChat user={user} initialMode='emergency' />;
      case 'insights':
         return <Insights user={user} onNavigate={setCurrentView} />;
      case 'strategy':
         return <StrategyView user={user} />;
      case 'profile':
        return <Profile user={user} plan={plan} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
      default:
        return <Dashboard user={user} plan={plan} onNavigate={setCurrentView} />;
    }
  };

  const NavButton: React.FC<{
    viewName: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ viewName, label, icon }) => {
    const isActive = currentView === viewName;
    return (
      <button
        onClick={() => setCurrentView(viewName)}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
          isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'
        }`}
      >
        {icon}
        <span className="text-[10px] mt-1">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Header oculto no FitTrack para ganhar espaço */}
      {currentView !== 'dashboard' && currentView !== 'activity' && (
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-lg font-bold text-primary">Fit-AI</h1>
              <button onClick={() => setCurrentView('dashboard')} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">Voltar</button>
            </div>
          </header>
      )}

      <main className={`flex-grow ${currentView === 'activity' ? '' : 'container mx-auto p-4 sm:p-6 pb-24 max-w-4xl'} ${currentView === 'dashboard' ? 'pt-4' : ''}`}>
        {renderView()}
      </main>
      
      {/* Navigation Bar Hidden inside FitTrack to allow its own internal navigation, shown elsewhere */}
      {currentView !== 'activity' && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 pb-safe">
            <nav className="flex justify-around max-w-4xl mx-auto">
              <NavButton viewName="dashboard" label="Início" icon={<HomeIcon />} />
              <NavButton viewName="strategy" label="Estratégia" icon={<BrainIcon />} />
              <NavButton viewName="activity" label="FitTrack" icon={<RunningIcon />} />
              <NavButton viewName="calorie" label="Calorias" icon={<CameraIcon />} />
              <NavButton viewName="profile" label="Perfil" icon={<UserIcon />} />
            </nav>
          </footer>
      )}
    </div>
  );
};

export default App;
