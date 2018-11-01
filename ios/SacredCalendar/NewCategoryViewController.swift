//
//  NewCategoryViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/31/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Cartography
import Color_Picker_for_iOS
import RxCocoa
import RxSwift
import UIKit

class NewCategoryViewModelServices: HasCreateCategoryService {
    let createCategory: CreateCategoryService
    
    init(createCategory: CreateCategoryService = .init()) {
        self.createCategory = createCategory
    }
}

class NewCategoryViewModel {
    typealias Services = HasCreateCategoryService
    
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let trash = DisposeBag()
    
    init(services: Services = NewCategoryViewModelServices()) {
        self.services = services
    }
    
    func submit(data: [String : Any]) -> Observable<Bool> {
        return services.createCategory.execute(data: data)
    }
}

class NewCategoryViewController: UIViewController {
    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var colorPickerContainer: UIView!
    @IBOutlet weak var submitButton: UIButton!
    
    let selectedColor = BehaviorSubject<UIColor>(value: .gray)
    
    let viewModel: NewCategoryViewModel
    
    let trash = DisposeBag()
    
    let formErrors = PublishSubject<[String]>()
    
    init(viewModel: NewCategoryViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "NewCategoryViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        set(title: "New Category")
        
        setup(submitButton: submitButton)
        
        let colorPicker = HRColorPickerView()
        colorPicker.addTarget(self, action: #selector(colorChanged(colorPicker:)), for: .valueChanged)
        colorPickerContainer.addSubview(colorPicker)
        constrain(colorPicker, colorPickerContainer) {
            $0.size == $1.size
            $0.center == $1.center
        }
    }
    
    @objc func colorChanged(colorPicker: HRColorPickerView) {
        selectedColor.onNext(colorPicker.color)
    }
    
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            nameField.rx.text.orEmpty,
            selectedColor
        )
        
        button.rx.tap
            .withLatestFrom(form)
            .map({ ($0, $1.hexString) })
            .filter({ [weak self] in
                self?.validate(name: $0, color: $1) ?? false
            }).map({[
                "name" : $0,
                "color" : $1,
            ]})
            .flatMap({ [weak self] in self?.viewModel.submit(data: $0) ?? .empty() })
            .subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
            }).disposed(by: trash)
    }
    
    func validate(name: String, color: String) -> Bool {
        return !name.isEmpty && !color.isEmpty
    }
}

extension UIColor {
    var hexString: String {
        guard let components = cgColor.components else { return "" }
        let r = lroundf(Float(components[0] * 255))
        let g = lroundf(Float(components[1] * 255))
        let b = lroundf(Float(components[2] * 255))
        return String(format: "#%02lX%02lX%02lX", r, g, b)
    }
}
