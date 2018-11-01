//
//  NewEventFormView.swift
//  SacredCalendar
//
//  Created by Developer on 10/31/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import iOSDropDown
import UIKit

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
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        commonInit()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        commonInit()
    }
    
    func commonInit() {
        Bundle.main.loadNibNamed("NewEventFormView", owner: self, options: nil)
        addSubview(contentView)
        
        contentView.frame = self.bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
    
}
