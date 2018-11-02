//
//  AppNavigationController.swift
//  SacredCalendar
//
//  Created by Developer on 10/30/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Material

/// Custom navigation controller subclass for Material experience.
class AppNavigationController: NavigationController {
    
    /// Overridden to provide custom look and feel.
    open override func prepare() {
        super.prepare()
       
        isMotionEnabled = true
        motionNavigationTransitionType = .auto
        
        guard let navbar = navigationBar as? NavigationBar else { return }
        
        navbar.backgroundColor = .white
        navbar.depthPreset = .none
        navbar.dividerColor = Color.grey.lighten2
    }
}
