#if defined(ACTION_DRIVER)
#ifndef ELECTRON_SHELL_BROWSER_UI_COCOA_ACTION_DRIVER_WATERMARK_VIEW_H_
#define ELECTRON_SHELL_BROWSER_UI_COCOA_ACTION_DRIVER_WATERMARK_VIEW_H_

#import <Cocoa/Cocoa.h>

@interface ProductWatermarkView : NSView
- (void)updateFrameFromWindow;
@end

#endif
#endif  // defined(ACTION_DRIVER)
