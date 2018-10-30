//
//  AppNavigationController.swift
//  SacredCalendar
//
//  Created by Developer on 10/30/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Material

class AppNavigationController: NavigationController {
    open override func prepare() {
        super.prepare()
        isMotionEnabled = true
        motionNavigationTransitionType = .auto
        guard let v = navigationBar as? NavigationBar else {
            return
        }
        
        v.backgroundColor = .white
        v.depthPreset = .none
        v.dividerColor = Color.grey.lighten2
    }
}
