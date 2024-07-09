//
//  SettingUIView.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/06/07.
//

import SwiftUI
import DarkEggKit

struct SettingUIView: View {
    @State private var totalHeight = CGFloat(0.0)
    @State private var popupHeight = CGFloat(0.0)
    @State private var ListHeight = CGFloat(0.0)
    
    @State private var gifWord: [String] = SettingManager.shared.keywords.gifKeyword
    @State private var popupWord: [String] = SettingManager.shared.keywords.popupKeyword
    @State private var listWord: [String] = SettingManager.shared.keywords.listKeyWord
    @State private var waitFinal: Bool = SettingManager.shared.keywords.waitFinal
    @State private var autoStopTime: Float = SettingManager.shared.keywords.autoStopTime
    @State private var maxAutoStopTime: Float = 10.0
    @State private var serverType: Int = SettingManager.shared.keywords.serverType
    
    @State private var inputGifWord: String = ""
    
    @State private var realtimeInterval: Float = SettingManager.shared.keywords.realtimeInterval
    @State private var realtimeTranslation: Bool = SettingManager.shared.keywords.realtimeTranslation
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            VStack {
                VStack(alignment: .leading, spacing: 8) {
//                    VStack(alignment: .leading, spacing: 8) {
                        // section title
                        Text("Keyword Setting").padding(.bottom, 0).font(.system(size: 15, weight: .bold, design: .rounded))
                        // rows
                        KeywordSettingCell(title: "Keyword for GIF", words: $gifWord)
                        KeywordSettingCell(title: "Keyword for Popup", words: $popupWord)
                        KeywordSettingCell(title: "Keyword for List", words: $listWord)
//                    }.padding(.bottom, 16)
                }.padding([.leading, .trailing], 20).padding([.top], 10).frame(alignment: .top)
                VStack(alignment: .leading, spacing: 16) {
                    Text("Wait for final").padding(.bottom, 0).font(.system(size: 15, weight: .bold, design: .rounded))
                    HStack {
//                        Text("Wait for final")
                        Toggle(isOn: $waitFinal) {
                            Text("Wait for final")
                        }.padding(10)
                    }.background(Color.gray.opacity(0.1)).cornerRadius(8)
                }.padding([.leading, .trailing], 20).padding([.top], 10).frame(alignment: .top)
                VStack(alignment: .leading, spacing: 8) {
                    Text("Auto stop STT after \(Int(autoStopTime)) minutes").padding(.bottom, 0).font(.system(size: 15, weight: .bold, design: .rounded)).onTapGesture(count: 3) {
                        if maxAutoStopTime == 10.0 {
                            maxAutoStopTime = 60.0
                        }
                        else {
                            maxAutoStopTime = 10.0
                            if autoStopTime > maxAutoStopTime {
                                autoStopTime = maxAutoStopTime
                            }
                        }
                    }
                    HStack {
                        Slider(value: $autoStopTime, in: 3.0...maxAutoStopTime, step: 1.0) {
                        } minimumValueLabel: {
                            Text("3")
                        } maximumValueLabel: {
                            Text("\(Int(maxAutoStopTime))")
                        }.padding(10)
                    }.background(Color.gray.opacity(0.1)).cornerRadius(8)
                    // realtime translate interval
                    Text("Realtime translate interval: \(String(format: "%0.1f", realtimeInterval)) seconds").padding(.bottom, 0).font(.system(size: 15, weight: .bold, design: .rounded))
                    HStack {
                        VStack{
                            Toggle(isOn: $realtimeTranslation) {
                            }.padding(10)
                        }.frame(width: 80)
                        Slider(value: $realtimeInterval, in: 0.6...3.0, step: 0.1) {
                        } minimumValueLabel: {
                            Text("0.6")
                        } maximumValueLabel: {
                            Text("3.0")
                        }.padding(10).disabled(!realtimeTranslation)
                    }.background(Color.gray.opacity(0.1)).cornerRadius(8)
                }.padding([.leading, .trailing], 20).padding([.top], 10).frame(alignment: .top)
                HStack {
                    Button("Save") {
                        saveSetting()
                    }.frame(width: 100, alignment: .center)
                }.padding([.top], 16)
            }
        }
        .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity, alignment: .topLeading)
        .edgesIgnoringSafeArea(.horizontal)
        .textFieldStyle(.roundedBorder)
        .onTapGesture {
            UIApplication.shared.sendAction(
                #selector(UIResponder.resignFirstResponder),
                to: nil,
                from: nil,
                for: nil
            )
        }
    }
    
    func saveSetting() {
        SettingManager.shared.keywords.gifKeyword = gifWord
        SettingManager.shared.keywords.popupKeyword = popupWord
        SettingManager.shared.keywords.listKeyWord = listWord
        SettingManager.shared.keywords.waitFinal = waitFinal
        SettingManager.shared.keywords.autoStopTime = autoStopTime
        SettingManager.shared.keywords.serverType = serverType
        SettingManager.shared.keywords.realtimeTranslation = realtimeTranslation
        SettingManager.shared.keywords.realtimeInterval = realtimeInterval
        // change stt api server
        SettingManager.shared.saveKeywords()
    }
}

// cell view
struct KeywordSettingCell: View {
    @State var title: String
    @State var placeholder: String = ""
    @State var listHeight: CGFloat = 0.0
    @State var inputWord: String = ""
    @Binding var words: [String]
    
    var body: some View {
        return VStack(alignment: .leading, spacing: 8) {
            Text(title).frame(width: 160, alignment: .leading).font(.system(size: 15, weight: .regular, design: .rounded))
            VStack {
                GeometryReader { geometry in
                    self.keywordList(for: words, in: geometry)
                }//.frame(width: .infinity, height: .infinity)
                //.background(Color.yellow)
            }.frame(height: listHeight)
            HStack {
                TextField(placeholder, text: $inputWord).frame(alignment: .leading)
                Button(action: {
                    addKeyword(inputWord)
                    inputWord = ""
                }) {
                    Image(systemName: "plus")
                    Text("Add")
                }.padding([.top, .bottom], 6).padding([.leading, .trailing], 8)
                .font(.body)
                .background(Color.orange)
//                .frame(width:120, height: 40)
                .foregroundColor(Color.white)
                .cornerRadius(8)
            }
        }
    }
    
    //
    private func addKeyword(_ word: String) {
        guard !(word.isEmpty), !(self.words.contains(word)) else {
            return
        }
        self.words.append(word)
    }
    
    private func removeKeyword(_ word: String) {
        guard let idx = self.words.firstIndex(of: word) else {
            return
        }
        self.words.remove(at: idx)
    }
    
    //
    private func keywordList(for keywords: [String], in g: GeometryProxy) -> some View {
        var width = CGFloat.zero
        var height = CGFloat.zero
        
        return ZStack(alignment: .topLeading) {
            ForEach(keywords, id: \.self) { word in
                self.keywordItem(of: word).padding([.horizontal, .vertical], 4)
                .alignmentGuide(.leading, computeValue: { d in
                    if (abs(width - d.width) > g.size.width) {
                        width = 0
                        height -= d.height
                    }
                    let result = width
                    if word == keywords.last! {
                        width = 0 //last item
                    } else {
                        width -= d.width
                    }
                    return result
                })
                .alignmentGuide(.top, computeValue: {d in
                    let result = height
                    if word == keywords.last! {
                        height = 0 // last item
                    }
                    return result
                })
            }
        }
        //.background(Color.green)
        .background( GeometryReader { gp -> Color in
            DispatchQueue.main.async {
                // update on next cycle with calculated height of ZStack !!!
                listHeight = gp.size.height
            }
            return Color.clear
        })
    }
    
    private func keywordItem(of text: String) -> some View {
        HStack {
            Text(text).font(.system(size: 13, weight: .regular, design: .rounded))
            Button(action: {
                self.removeKeyword(text)
            }){
                Image(systemName: "xmark")
            }.padding(.all, 4)
            .font(.body)
            .background(Color.gray)
            .frame(width: 16, height: 16)
            .foregroundColor(Color.white)
            .cornerRadius(8)
        }
        .padding(.all, 5)
        .font(.body)
        .background(Color.gray)
        .foregroundColor(Color.white)
        .cornerRadius(5)
    }
}

struct SettingUIView_Previews: PreviewProvider {
    static var previews: some View {
        SettingUIView()
    }
}
