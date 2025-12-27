import { supabase } from './supabase';
import { User, StageProgress } from '../types';

export type ActionType = 'UPLOAD_FILE' | 'TALK_TO_PILOT' | 'FORM_INPUT';

export interface VerificationActionConfig {
    type: ActionType;
    label: string;
    config: {
        targetFolder?: string; // For Uploads
        aiAnalysisType?: string; // For Uploads
        intent?: string; // For Chat
        formId?: string; // For Forms
        allowMultiple?: boolean;
    };
}

export const ROADMAP_CONFIG = {
    0: {
        id: 0,
        name: "Orientation",
        required_tasks: [
            {
                id: 'profile_setup',
                label: "Complete Smart Onboarding",
                action: { type: 'TALK_TO_PILOT', label: 'Start Onboarding Chat', config: { intent: 'onboarding-intro' } }
            },
            {
                id: 'inspiration_upload',
                label: "Upload Inspiration",
                action: { type: 'UPLOAD_FILE', label: 'Upload Images', config: { targetFolder: 'Inspiration', allowMultiple: true } }
            }
        ]
    },
    1: {
        id: 1,
        name: "Financial Foundation",
        required_tasks: [
            {
                id: 'lender_path',
                label: "Select Financial Pathway",
                action: { type: 'FORM_INPUT', label: 'Select Path', config: { formId: 'select-lender-type' } }
            },
            {
                id: 'proof_of_funds',
                label: "Upload Pre-Approval / POF",
                action: { type: 'UPLOAD_FILE', label: 'Upload Financials', config: { targetFolder: 'Financials', aiAnalysisType: 'pre-approval' } }
            },
            {
                id: 'hard_budget',
                label: "Define Hard Budget Cap",
                action: { type: 'FORM_INPUT', label: 'Set Budget', config: { formId: 'set-hard-budget' } }
            }
        ],
        unlocks_tab: 'TheLedger'
    },
    2: {
        id: 2,
        name: "Land Acquisition",
        required_tasks: [
            {
                id: 'land_contract',
                label: "Upload Land Contract/Deed",
                action: { type: 'UPLOAD_FILE', label: 'Upload Contract', config: { targetFolder: 'Land', aiAnalysisType: 'contract' } }
            },
            {
                id: 'survey_report',
                label: "Upload Survey/Soil Report",
                action: { type: 'UPLOAD_FILE', label: 'Upload Survey', config: { targetFolder: 'Land', aiAnalysisType: 'survey' } }
            },
            {
                id: 'address_confirm',
                label: "Confirm Site Address",
                action: { type: 'FORM_INPUT', label: 'Confirm Address', config: { formId: 'confirm-address' } }
            }
        ]
    },
    3: {
        id: 3,
        name: "Design & Engineering",
        required_tasks: [
            {
                id: 'design_contract',
                label: "Sign Design-Only Agreement",
                action: { type: 'UPLOAD_FILE', label: 'Upload Agreement', config: { targetFolder: 'Contracts', aiAnalysisType: 'pcs-agreement' } }
            },
            {
                id: 'floor_plans',
                label: "Finalize Floor Plans",
                action: { type: 'UPLOAD_FILE', label: 'Upload Plans', config: { targetFolder: 'Plans', aiAnalysisType: 'floor-plan' } }
            },
            {
                id: 'builder_select',
                label: "Select Builder",
                action: { type: 'TALK_TO_PILOT', label: 'Vet Builders', config: { intent: 'vet-builders' } }
            }
        ],
        unlocks_tab: 'TheTeam'
    },
    4: {
        id: 4,
        name: "Preconstruction",
        required_tasks: [
            { id: 'construction_contract', label: "Sign Construction Contract", action: { type: 'UPLOAD_FILE', label: 'Upload Contract', config: { targetFolder: 'Contracts' } } },
            { id: 'permit_receipt', label: "Verify Permit Submission", action: { type: 'UPLOAD_FILE', label: 'Upload Receipt', config: { targetFolder: 'Permits' } } },
            { id: 'bank_closing', label: "Bank Closing Complete", action: { type: 'FORM_INPUT', label: 'Confirm Closing', config: { formId: 'confirm-closing' } } }
        ]
    },
    5: {
        id: 5,
        name: "Construction",
        required_tasks: [
            { id: 'schedule_uploaded', label: "Upload Construction Schedule", action: { type: 'UPLOAD_FILE', label: 'Upload Schedule', config: { targetFolder: 'Schedules' } } },
            { id: 'first_draw', label: "First Draw Processed", action: { type: 'FORM_INPUT', label: 'Verify Draw', config: { formId: 'verify-draw' } } }
        ],
        unlocks_tab: 'TheJobsite'
    },
    6: {
        id: 6,
        name: "The Summit",
        required_tasks: [
            { id: 'punch_list', label: "Final Walkthrough List", action: { type: 'FORM_INPUT', label: 'Start Punch List', config: { formId: 'punch-list' } } },
            { id: 'occupancy_permit', label: "Upload Occupancy Permit", action: { type: 'UPLOAD_FILE', label: 'Upload CO', config: { targetFolder: 'Permits' } } }
        ]
    }
};

export const RoadmapService = {

    /**
     * Checks if a user has unlocked a specific stage.
     * A stage is unlocked if the PREVIOUS stage is verified (completed).
     * Stage 0 is always unlocked.
     */
    isStageUnlocked: (user: User, stageId: number): boolean => {
        if (stageId === 0) return true;

        // To unlock Stage N, Stage N-1 must be verified
        const prevStageProgress = user.stage_progress?.[stageId - 1];
        return !!prevStageProgress?.is_verified;
    },

    /**
     * Calculates the completion status of a stage.
     */
    getStageStatus: (user: User, stageId: number) => {
        const isUnlocked = RoadmapService.isStageUnlocked(user, stageId);
        if (!isUnlocked) return 'locked';

        const progress = user.stage_progress?.[stageId];
        if (progress?.is_verified) return 'completed';

        return 'active';
    },

    /**
     * Verifies a specific task for a user and updates Supabase.
     * If all tasks are done, marks the stage as verified.
     */
    verifyTask: async (userId: string, stageId: number, taskId: string, currentProgress: StageProgress | undefined) => {
        const stageConfig = ROADMAP_CONFIG[stageId as keyof typeof ROADMAP_CONFIG];
        if (!stageConfig) throw new Error("Invalid Stage ID");

        // Get existing progress for this stage
        const existingStageData = currentProgress?.[stageId] || { completed_tasks: [], is_verified: false };

        // Add task if not present
        if (!existingStageData.completed_tasks.includes(taskId)) {
            existingStageData.completed_tasks.push(taskId);
        }

        // Check availability of verification
        const allTasksDone = stageConfig.required_tasks.every(t => existingStageData.completed_tasks.includes(t.id));
        if (allTasksDone) {
            existingStageData.is_verified = true;
        }

        // Construct new JSONb object to merge
        // We cannot just patch one key in a JSONB column easily without replacing the whole object or using advanced path queries.
        // For safety, we will merge with existing `stage_progress` from the User object passed in, 
        // BUT `currentProgress` passed here should be the whole `user.stage_progress` object.

        const newProgress = {
            ...currentProgress,
            [stageId]: existingStageData
        };

        // If verified, we also update `current_stage` column if this was the current stage
        // e.g. if I just finished Stage 0, my current_stage should bump to 1.
        let updates: any = { stage_progress: newProgress };

        // Check if we should bump the pointer
        // logic: if I completed stage N, and my DB current_stage is N, bump to N+1
        // We handle this loosely here; simple increment logic.
        if (existingStageData.is_verified) {
            // We'd need to know the active current_stage from DB, but usually we proceed linearly.
            // For now we just save the progress. The logic to "move" the user can be separate or implicit.
            // Actually, let's bump the current stage in the DB if we just verified the stage we are on.
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        // If we verified the stage, we might want to also update the integer `current_stage` pointer
        if (existingStageData.is_verified) {
            // Fetch current to be safe? Or just blindly increment?
            // Safest is to just update progress. The "Current Phase" in UI can differ from "Highest Unlocked".
            // Let's also update the integer for easy querying.
            // We can use a stored procedure or just a second generic update, 
            // but let's assume `current_stage` tracks the HIGHEST ACTIVE stage.
            // So if Stage 0 is done, current_stage becomes 1.

            // We can do this in a separate call or same if we knew the value. 
            // Let's assume the UI will refresh context.
            await supabase.from('profiles').update({ current_stage: stageId + 1 }).eq('id', userId).match({ current_stage: stageId });
        }

        return newProgress;
    },

    /**
     * Check if a specific feature TAB should be visible
     */
    isFeatureUnlocked: (user: User | null, featureKey: 'TheLedger' | 'TheTeam' | 'TheJobsite') => {
        if (!user) return false;

        // Ledger unlocks at Stage 1 (so Stage 0 must be done)
        if (featureKey === 'TheLedger') return RoadmapService.isStageUnlocked(user, 1);

        // Team unlocks at Stage 3 (so Stage 2 must be done)
        if (featureKey === 'TheTeam') return RoadmapService.isStageUnlocked(user, 3);

        // Jobsite unlocks at Stage 5 (so Stage 4 must be done)
        if (featureKey === 'TheJobsite') return RoadmapService.isStageUnlocked(user, 5);

        return false;
    }
};
