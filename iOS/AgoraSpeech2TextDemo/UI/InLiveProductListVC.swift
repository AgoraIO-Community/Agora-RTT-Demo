//
//  InLiveProductListVC.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/09/06.
//

import UIKit
import DarkEggKit

class InLiveProductListVC: UIViewController {
    @IBOutlet private weak var imgView: UIImageView!
    @IBOutlet private weak var closeButton: UIButton!
    
    var productId: String = "" {
        didSet {
            Logger.debug(productId)
        }
    }
    
    private var isPresenting: Bool = false
    
    private var tap: UITapGestureRecognizer!
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        Logger.debug("LifeCycle Test")
        self.modalPresentationStyle = .custom
        self.transitioningDelegate = self
        self.tap = UITapGestureRecognizer(target: self, action: #selector(self.onContainerTapped))
        //fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        imgView.image = UIImage(named: productId)
    }
    
    deinit {
        Logger.debug("LifeCycle Test")
    }
}

extension InLiveProductListVC {
    @IBAction private func onCloseButtonClicked(_ sender: UIButton) {
        Logger.debug()
        self.dismiss(animated: true)
    }
    
    
    @objc private func onContainerTapped(_ sender: UITapGestureRecognizer) {
        Logger.debug()
        self.dismiss(animated: true)
    }
}

extension InLiveProductListVC: UIViewControllerAnimatedTransitioning {
    func transitionDuration(using transitionContext: UIViewControllerContextTransitioning?) -> TimeInterval {
        return 0.5
    }
    
    func animateTransition(using transitionContext: UIViewControllerContextTransitioning) {
        let container = transitionContext.containerView
        let fromVC = transitionContext.viewController(forKey: !self.isPresenting ? .to : .from)!
        let toVC = transitionContext.viewController(forKey: !self.isPresenting ? .from : .to)!
        let fromView = fromVC.view
        let toView = toVC.view
        
        //设置动画初始位置
        let panelHeight = UIScreen.main.bounds.height * 0.33
        let width = UIScreen.main.bounds.width
        let height = UIScreen.main.bounds.height
        let startFrame = CGRectMake(0, height, width, panelHeight)
        let targetFrame = CGRectMake(0, height-panelHeight, width, panelHeight)
        
        if self.isPresenting {
            toView!.frame = startFrame
            container.addSubview(toView!)
//            self.setOffAnimation(menuVC: toVC as! MenuVC)
        }
        else {
            toView!.frame = targetFrame
            container.insertSubview(toView!, belowSubview: fromView!)
        }
        
        container.backgroundColor = .systemBackground.withAlphaComponent(0.5)
        container.removeGestureRecognizer(self.tap)
        
        let duration = self.transitionDuration(using: transitionContext)
        UIView.animate(withDuration: duration, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0.7, options: UIView.AnimationOptions.curveEaseInOut, animations: {
            if self.isPresenting {
//                fromView!.frame = UIScreen.main.bounds
                toView!.frame = targetFrame
//                self.setOnAnimation(menuVC: toVC as! MenuVC)
            }
            else {
                toView!.frame = startFrame
//                self.setOffAnimation(menuVC: toVC as! MenuVC)
            }
        }, completion: {(finish:Bool) in
            transitionContext.completeTransition(!(transitionContext.transitionWasCancelled))
            if self.isPresenting {
                container.addGestureRecognizer(self.tap)
            }
        })
    }
}

extension InLiveProductListVC: UIViewControllerTransitioningDelegate {
    //presented
    func animationController(forPresented presented: UIViewController, presenting: UIViewController, source: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        Logger.debug()
        self.isPresenting = true
        return self
    }
    
    //dismissed
    func animationController(forDismissed dismissed: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        Logger.debug()
        self.isPresenting = false
        return self
    }
}
