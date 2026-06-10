const ONBOARDING_KEY = 'smorzar-onboarding-v1'
const INSTALL_KEY = 'smorzar-install-v1'

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'done'
  } catch {
    return false
  }
}

function setFlag(key: string): void {
  try {
    localStorage.setItem(key, 'done')
  } catch {
    /* ignore */
  }
}

export const onboardingDone = () => readFlag(ONBOARDING_KEY)
export const markOnboardingDone = () => setFlag(ONBOARDING_KEY)

export const installDone = () => readFlag(INSTALL_KEY)
export const markInstallDone = () => setFlag(INSTALL_KEY)
