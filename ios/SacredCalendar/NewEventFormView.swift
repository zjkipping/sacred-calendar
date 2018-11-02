//
//  NewEventFormView.swift
//  SacredCalendar
//
//  Created by Developer on 10/31/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import iOSDropDown
import UIKit

/// Visuals for the form for creating a new event.
class NewEventFormView: UIView {
    
    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var descriptionField: UITextField!
    @IBOutlet weak var locationField: UITextField!
    
    @IBOutlet weak var editStartTimeButton: UIButton!
    @IBOutlet weak var editEndTimeButton: UIButton!
    
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var editDateButton: UIButton!
    
    @IBOutlet weak var startDateLabel: UILabel!
    @IBOutlet weak var endDateLabel: UILabel!
    
    @IBOutlet weak var categoryDropdown: DropDown!
    @IBOutlet weak var newCategoryButton: UIButton!
    
    @IBOutlet weak var contentView: UIView!

    /// Constructor - Delegates to the common init.
    override init(frame: CGRect) {
        super.init(frame: frame)
        commonInit()
    }
    
    /// Constructor - Delegates to the common init.
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        commonInit()
    }
    
    /// 'Constructor' - Shared constructor for attaching owner to visuals from .nib.
    func commonInit() {
        Bundle.main.loadNibNamed("NewEventFormView", owner: self, options: nil)
        addSubview(contentView)
        
        contentView.frame = self.bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
    
}
