#if defined(ACTION_DRIVER)
#import <Cocoa/Cocoa.h>
#include <cassert>
#include <cstdio>
#include "shell/browser/ui/cocoa/action_driver/watermark_view.h"

int main() {
  @autoreleasepool {
    [NSApplication sharedApplication];
    __weak ActionDriverWatermarkView* released_view = nil;
    @autoreleasepool {
      NSWindow* window = [[NSWindow alloc]
          initWithContentRect:NSMakeRect(0, 0, 800, 600)
                    styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskResizable
                      backing:NSBackingStoreBuffered defer:NO];
      window.releasedWhenClosed = NO;
      ActionDriverWatermarkView* view = [[ActionDriverWatermarkView alloc]
          initWithFrame:NSZeroRect];
      released_view = view;
      NSView* parent = window.contentView.superview;
      [parent addSubview:view positioned:NSWindowAbove relativeTo:window.contentView];
      [view updateFrameFromWindow];
      assert([view hitTest:NSMakePoint(30, 30)] == nil);
      assert(!view.acceptsFirstResponder);
      assert(!view.isAccessibilityElement);
      assert(!view.isOpaque);
      assert(NSWidth(view.frame) == 800);
      assert([parent.subviews indexOfObject:view] >
             [parent.subviews indexOfObject:window.contentView]);
      [window setContentSize:NSMakeSize(1100, 700)];
      [view updateFrameFromWindow];
      assert(NSWidth(view.frame) == 1100);
      assert(NSHeight(view.frame) == 700);
      for (NSString* appearance in @[NSAppearanceNameAqua, NSAppearanceNameDarkAqua]) {
        window.appearance = [NSAppearance appearanceNamed:appearance];
        NSBitmapImageRep* image = [view bitmapImageRepForCachingDisplayInRect:view.bounds];
        [view cacheDisplayInRect:view.bounds toBitmapImageRep:image];
        bool drew_text = false;
        for (NSInteger y = 0; y < image.pixelsHigh && !drew_text; ++y) {
          for (NSInteger x = 0; x < image.pixelsWide; ++x) {
            if ([image colorAtX:x y:y].alphaComponent > 0.001) {
              drew_text = true;
              break;
            }
          }
        }
        assert(drew_text);
      }
      [view removeFromSuperview];
      view = nil;
      [window close];
      window = nil;
    }
    assert(released_view == nil);
    std::puts("NATIVE_WATERMARK_PASS");
  }
}
#endif
