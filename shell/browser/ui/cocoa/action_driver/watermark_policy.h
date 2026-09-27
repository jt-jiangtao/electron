#if defined(ACTION_DRIVER)
#ifndef ELECTRON_SHELL_BROWSER_UI_COCOA_ACTION_DRIVER_WATERMARK_POLICY_H_
#define ELECTRON_SHELL_BROWSER_UI_COCOA_ACTION_DRIVER_WATERMARK_POLICY_H_

namespace electron::action_driver {
constexpr bool ShouldShowWatermark(bool has_switch) {
#if defined(ACTION_DRIVER_DEVELOPMENT)
  return true;
#else
  return has_switch;
#endif
}
}  // namespace electron::action_driver

#endif
#endif  // defined(ACTION_DRIVER)
