import { BuildStrategy } from '@quantum/contracts/modules/repository/domain';

export const BUILD_STRATEGIES: BuildStrategy[] = [
    BuildStrategy.Auto,
    BuildStrategy.Dockerfile,
    BuildStrategy.PrebuiltImage,
    BuildStrategy.Exec
];

export const BUILD_STRATEGY_LABELS: Record<BuildStrategy, string> = {
    [BuildStrategy.Auto]: 'Auto',
    [BuildStrategy.Dockerfile]: 'Dockerfile',
    [BuildStrategy.PrebuiltImage]: 'Prebuilt image',
    [BuildStrategy.Exec]: 'Exec'
};
