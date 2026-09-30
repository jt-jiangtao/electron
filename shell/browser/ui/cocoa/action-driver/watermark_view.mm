#if defined(ACTION_DRIVER)
#include "shell/browser/ui/cocoa/action-driver/watermark_view.h"

#include <cmath>

@implementation ProductWatermarkView {
  __weak NSWindow* observed_window_;
}

- (instancetype)initWithFrame:(NSRect)frame {
  if ((self = [super initWithFrame:frame])) {
    self.wantsLayer = YES;
    self.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    self.focusRingType = NSFocusRingTypeNone;
    [self setAccessibilityElement:NO];
  }
  return self;
}

- (BOOL)isOpaque {
  return NO;
}

- (BOOL)acceptsFirstResponder {
  return NO;
}

- (NSView*)hitTest:(NSPoint)point {
  return nil;
}

- (void)viewDidMoveToWindow {
  [super viewDidMoveToWindow];
  NSNotificationCenter* center = [NSNotificationCenter defaultCenter];
  [center removeObserver:self];
  observed_window_ = self.window;
  if (observed_window_) {
    for (NSNotificationName name in @[
           NSWindowDidResizeNotification,
           NSWindowDidEnterFullScreenNotification,
           NSWindowDidExitFullScreenNotification
         ]) {
      [center addObserver:self
                 selector:@selector(windowGeometryChanged:)
                     name:name
                   object:observed_window_];
    }
    [self updateFrameFromWindow];
  }
}

- (void)windowGeometryChanged:(NSNotification*)notification {
  [self updateFrameFromWindow];
}

- (void)updateFrameFromWindow {
  if (self.window && self.superview) {
    self.frame = [self.superview convertRect:self.window.contentLayoutRect
                                  fromView:nil];
    self.needsDisplay = YES;
  }
}

- (void)resizeWithOldSuperviewSize:(NSSize)old_size {
  [self updateFrameFromWindow];
}

- (void)viewDidChangeEffectiveAppearance {
  [super viewDidChangeEffectiveAppearance];
  self.needsDisplay = YES;
}

- (void)drawRect:(NSRect)dirty_rect {
  [NSGraphicsContext saveGraphicsState];
  NSRectClip(self.bounds);
  NSAffineTransform* transform = [NSAffineTransform transform];
  [transform translateXBy:NSMidX(self.bounds) yBy:NSMidY(self.bounds)];
  [transform rotateByDegrees:-25];
  [transform concat];

  NSDictionary* attributes = @{
    NSFontAttributeName : [NSFont systemFontOfSize:23
                                          weight:NSFontWeightMedium],
    NSForegroundColorAttributeName : [[NSColor labelColor]
        colorWithAlphaComponent:0.05],
  };
  CGFloat radius = std::hypot(NSWidth(self.bounds), NSHeight(self.bounds)) / 2;
  for (CGFloat y = -radius; y <= radius; y += 140) {
    for (CGFloat x = -radius; x <= radius; x += 280) {
      [@"action-driver-dev" drawAtPoint:NSMakePoint(x, y)
                       withAttributes:attributes];
    }
  }
  [NSGraphicsContext restoreGraphicsState];
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
#endif  // defined(ACTION_DRIVER)
