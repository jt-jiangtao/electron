#if defined(ACTION_DRIVER)
#include "shell/browser/ui/cocoa/action-driver/watermark_policy.h"
int main() {
#if defined(ACTION_DRIVER_DEVELOPMENT)
  static_assert(electron::action_driver::ShouldShowWatermark(false));
#else
  static_assert(!electron::action_driver::ShouldShowWatermark(false));
#endif
  static_assert(electron::action_driver::ShouldShowWatermark(true));
}
#else
int main() {}
#endif
