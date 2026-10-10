-- Mid-plan pause when a selected capability is unavailable (Master Spec §143).
ALTER TYPE "OrchestrationStepStatus" ADD VALUE IF NOT EXISTS 'NEEDS_APPROVAL';
