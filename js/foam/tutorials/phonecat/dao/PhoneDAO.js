/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.tutorials.phonecat.dao',
  name: 'PhoneDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.tutorials.phonecat.model.Phone',
    'MDAO'
  ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        var dao = this.MDAO.create({ model: this.Phone });
        dao.put(this.Phone.create({
          "id": "motorola-xoom-with-wi-fi",
          "age": 0,
          "imageUrl": "./img/phones/motorola-xoom-with-wi-fi.0.jpg",
          "name": "Motorola XOOM™ with Wi-Fi",
          "snippet": "The Next, Next Generation\u000d\u000a\u000d\u000aExperience the future with Motorola XOOM with Wi-Fi, the world's first tablet powered by Android 3.0 (Honeycomb).",
          "additionalFeatures": "Sensors: proximity, ambient light, barometer, gyroscope",
          "android": {
            "os": "Android 3.0",
            "ui": "Honeycomb"
          },
          "availability": [
            ""
          ],
          "battery": {
            "standbyTime": "336 hours",
            "talkTime": "24 hours",
            "type": "Other ( mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Motorola XOOM with Wi-Fi has a super-powerful dual-core processor and Android™ 3.0 (Honeycomb) — the Android platform designed specifically for tablets. With its 10.1-inch HD widescreen display, you’ll enjoy HD video in a thin, light, powerful and upgradeable tablet.",
          "display": {
            "screenResolution": "WXGA (1200 x 800)",
            "screenSize": "10.1 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 GHz Dual Core Tegra 2",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-xoom-with-wi-fi.0.jpg",
            "img/phones/motorola-xoom-with-wi-fi.1.jpg",
            "img/phones/motorola-xoom-with-wi-fi.2.jpg",
            "img/phones/motorola-xoom-with-wi-fi.3.jpg",
            "img/phones/motorola-xoom-with-wi-fi.4.jpg",
            "img/phones/motorola-xoom-with-wi-fi.5.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "249.1 mm (w)",
              "167.8 mm (h)",
              "12.9 mm (d)"
            ],
            "weight": "708.0 grams"
          },
          "storage": {
            "flash": "32000MB",
            "ram": "1000MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "motorola-xoom",
          "age": 1,
          "imageUrl": "./img/phones/motorola-xoom.0.jpg",
          "name": "MOTOROLA XOOM™",
          "snippet": "The Next, Next Generation\u000a\u000aExperience the future with MOTOROLA XOOM, the world's first tablet powered by Android 3.0 (Honeycomb).",
          "additionalFeatures": "Front-facing camera. Sensors: proximity, ambient light, barometer, gyroscope.",
          "android": {
            "os": "Android 3.0",
            "ui": "Android"
          },
          "availability": [
            "Verizon"
          ],
          "battery": {
            "standbyTime": "336 hours",
            "talkTime": "24 hours",
            "type": "Other (3250 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "CDMA 800 /1900 LTE 700, Rx diversity in all bands",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 a/b/g/n"
          },
          "description": "MOTOROLA XOOM has a super-powerful dual-core processor and Android™ 3.0 (Honeycomb) — the Android platform designed specifically for tablets. With its 10.1-inch HD widescreen display, you’ll enjoy HD video in a thin, light, powerful and upgradeable tablet.",
          "display": {
            "screenResolution": "WXGA (1200 x 800)",
            "screenSize": "10.1 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 GHz Dual Core Tegra 2",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-xoom.0.jpg",
            "img/phones/motorola-xoom.1.jpg",
            "img/phones/motorola-xoom.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "249.0 mm (w)",
              "168.0 mm (h)",
              "12.7 mm (d)"
            ],
            "weight": "726.0 grams"
          },
          "storage": {
            "flash": "32000MB",
            "ram": "1000MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "motorola-atrix-4g",
          "age": 2,
          "imageUrl": "./img/phones/motorola-atrix-4g.0.jpg",
          "name": "MOTOROLA ATRIX™ 4G",
          "snippet": "MOTOROLA ATRIX 4G the world's most powerful smartphone.",
          "additionalFeatures": "",
          "android": {
            "os": "Android 2.2",
            "ui": "MOTOBLUR"
          },
          "availability": [
            "AT&amp;T"
          ],
          "battery": {
            "standbyTime": "400 hours",
            "talkTime": "5 hours",
            "type": "Lithium Ion (Li-Ion) (1930 mAH)"
          },
          "camera": {
            "features": [
              ""
            ],
            "primary": ""
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "WCDMA 850/1900/2100, GSM 850/900/1800/1900, HSDPA 14Mbps (Category 10) Edge Class 12, GPRS Class 12, eCompass, AGPS",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 a/b/g/n"
          },
          "description": "MOTOROLA ATRIX 4G gives you dual-core processing power and the revolutionary webtop application. With webtop and a compatible Motorola docking station, sold separately, you can surf the Internet with a full Firefox browser, create and edit docs, or access multimedia on a large screen almost anywhere.",
          "display": {
            "screenResolution": "QHD (960 x 540)",
            "screenSize": "4.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 GHz Dual Core",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-atrix-4g.0.jpg",
            "img/phones/motorola-atrix-4g.1.jpg",
            "img/phones/motorola-atrix-4g.2.jpg",
            "img/phones/motorola-atrix-4g.3.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "63.5 mm (w)",
              "117.75 mm (h)",
              "10.95 mm (d)"
            ],
            "weight": "135.0 grams"
          },
          "storage": {
            "flash": "",
            "ram": ""
          }
        }));
        dao.put(this.Phone.create({
          "id": "dell-streak-7",
          "age": 3,
          "imageUrl": "./img/phones/dell-streak-7.0.jpg",
          "name": "Dell Streak 7",
          "snippet": "Introducing Dell™ Streak 7. Share photos, videos and movies together. It’s small enough to carry around, big enough to gather around.",
          "additionalFeatures": "Front Facing 1.3MP Camera",
          "android": {
            "os": "Android 2.2",
            "ui": "Dell Stage"
          },
          "availability": [
            "T-Mobile"
          ],
          "battery": {
            "standbyTime": "",
            "talkTime": "",
            "type": "Lithium Ion (Li-Ion) (2780 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "T-mobile HSPA+ @ 2100/1900/AWS/850 MHz",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g"
          },
          "description": "Introducing Dell™ Streak 7. Share photos, videos and movies together. It’s small enough to carry around, big enough to gather around. Android™ 2.2-based tablet with over-the-air upgrade capability for future OS releases.  A vibrant 7-inch, multitouch display with full Adobe® Flash 10.1 pre-installed.  Includes a 1.3 MP front-facing camera for face-to-face chats on popular services such as Qik or Skype.  16 GB of internal storage, plus Wi-Fi, Bluetooth and built-in GPS keeps you in touch with the world around you.  Connect on your terms. Save with 2-year contract or flexibility with prepaid pay-as-you-go plans",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "7.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "nVidia Tegra T20",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/dell-streak-7.0.jpg",
            "img/phones/dell-streak-7.1.jpg",
            "img/phones/dell-streak-7.2.jpg",
            "img/phones/dell-streak-7.3.jpg",
            "img/phones/dell-streak-7.4.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "199.9 mm (w)",
              "119.8 mm (h)",
              "12.4 mm (d)"
            ],
            "weight": "450.0 grams"
          },
          "storage": {
            "flash": "16000MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "samsung-gem",
          "age": 4,
          "imageUrl": "./img/phones/samsung-gem.0.jpg",
          "name": "Samsung Gem™",
          "snippet": "The Samsung Gem™ brings you everything that you would expect and more from a touch display smart phone – more apps, more features and a more affordable price.",
          "additionalFeatures": "3.2” Full touch screen with Advanced anti smudge, anti reflective and anti scratch glass; Swype text input for easy and fast message creation; multiple messaging options, including text with threaded messaging for organized, easy-to-follow text; Social Community support, including Facebook and MySpace; Next generation Address book; Visual Voice Mail\u000a",
          "android": {
            "os": "Android 2.1",
            "ui": "TouchWiz"
          },
          "availability": [
            "Cellular South"
          ],
          "battery": {
            "standbyTime": "800 hours",
            "talkTime": "7 hours",
            "type": "Nickel Cadmium (NiCd) (1500 mAH)"
          },
          "camera": {
            "features": [
              ""
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 3.0",
            "cell": "3G/CDMA : 850MHz/1900MHz\u000a",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g"
          },
          "description": "The Samsung Gem™ maps a route to a smarter mobile experience. By pairing one of the fastest processors in the category with the Android™ platform, the Gem delivers maximum multitasking speed and social networking capabilities to let you explore new territory online. A smart phone at an even smarter price is a real find, so uncover the Gem and discover what’s next.",
          "display": {
            "screenResolution": "WQVGA (400 x 240)",
            "screenSize": "3.2 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "800 MHz",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/samsung-gem.0.jpg",
            "img/phones/samsung-gem.1.jpg",
            "img/phones/samsung-gem.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "55.5 mm (w)",
              "113.0 mm (h)",
              "12.4 mm (d)"
            ],
            "weight": "110.0 grams"
          },
          "storage": {
            "flash": "220MB",
            "ram": "256MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "dell-venue",
          "age": 5,
          "imageUrl": "./img/phones/dell-venue.0.jpg",
          "name": "Dell Venue",
          "snippet": "The Dell Venue; Your Personal Express Lane to Everything",
          "additionalFeatures": "Gorilla Glass display, Dedicated Camera Key, Ring Silence Switch, Swype keyboard.",
          "android": {
            "os": "Android 2.2",
            "ui": "Dell Stage"
          },
          "availability": [
            "AT&amp;T,",
            "KT,",
            "T-Mobile"
          ],
          "battery": {
            "standbyTime": "400 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1400 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "8.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "850/1900/2100 3G; 850/900/1800/1900 GSM/GPRS/EDGE\u000a900/1700/2100 3G; 850/900/1800/1900 GSM/GPRS/EDGE",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "The Venue is the perfect one-touch, Smart Phone providing instant access to everything you love. All of Venue's features make it perfect for on-the-go students, mobile professionals, and active social communicators who love style and performance.\u000a\u000aElegantly designed, the Venue offers a vibrant, curved glass display that’s perfect for viewing all types of content. The Venue’s slender form factor feels great in your hand and also slips easily into your pocket.  A mobile entertainment powerhouse that lets you download the latest tunes from Amazon MP3 or books from Kindle, watch video, or stream your favorite radio stations.  All on the go, anytime, anywhere.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "4.1 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 Ghz processor",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/dell-venue.0.jpg",
            "img/phones/dell-venue.1.jpg",
            "img/phones/dell-venue.2.jpg",
            "img/phones/dell-venue.3.jpg",
            "img/phones/dell-venue.4.jpg",
            "img/phones/dell-venue.5.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "64.0 mm (w)",
              "121.0 mm (h)",
              "12.9 mm (d)"
            ],
            "weight": "164.0 grams"
          },
          "storage": {
            "flash": "1000MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "nexus-s",
          "age": 6,
          "imageUrl": "./img/phones/nexus-s.0.jpg",
          "name": "Nexus S",
          "snippet": "Fast just got faster with Nexus S. A pure Google experience, Nexus S is the first phone to run Gingerbread (Android 2.3), the fastest version of Android yet.",
          "additionalFeatures": "Contour Display, Near Field Communications (NFC), Three-axis gyroscope, Anti-fingerprint display coating, Internet Calling support (VoIP/SIP)",
          "android": {
            "os": "Android 2.3",
            "ui": "Android"
          },
          "availability": [
            "M1,",
            "O2,",
            "Orange,",
            "Singtel,",
            "StarHub,",
            "T-Mobile,",
            "Vodafone"
          ],
          "battery": {
            "standbyTime": "428 hours",
            "talkTime": "6 hours",
            "type": "Lithium Ion (Li-Ion) (1500 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "Quad-band GSM: 850, 900, 1800, 1900\u000d\u000aTri-band HSPA: 900, 2100, 1700\u000d\u000aHSPA type: HSDPA (7.2Mbps) HSUPA (5.76Mbps)",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Nexus S is the next generation of Nexus devices, co-developed by Google and Samsung. The latest Android platform (Gingerbread), paired with a 1 GHz Hummingbird processor and 16GB of memory, makes Nexus S one of the fastest phones on the market. It comes pre-installed with the best of Google apps and enabled with new and popular features like true multi-tasking, Wi-Fi hotspot, Internet Calling, NFC support, and full web browsing. With this device, users will also be the first to receive software upgrades and new Google mobile apps as soon as they become available. For more details, visit http://www.google.com/nexus.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "4.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1GHz Cortex A8 (Hummingbird) processor",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/nexus-s.0.jpg",
            "img/phones/nexus-s.1.jpg",
            "img/phones/nexus-s.2.jpg",
            "img/phones/nexus-s.3.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "63.0 mm (w)",
              "123.9 mm (h)",
              "10.88 mm (d)"
            ],
            "weight": "129.0 grams"
          },
          "storage": {
            "flash": "16384MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "lg-axis",
          "age": 7,
          "imageUrl": "./img/phones/lg-axis.0.jpg",
          "name": "LG Axis",
          "snippet": "Android Powered, Google Maps Navigation, 5 Customizable Home Screens",
          "additionalFeatures": "Accessibility features: Tactile QWERTY keyboard, four-direction keypad, start and end call buttons, dedicated number keys, camera button, TalkBack screen reader",
          "android": {
            "os": "Android 2.1",
            "ui": "LG Home"
          },
          "availability": [
            "Cellular South"
          ],
          "battery": {
            "standbyTime": "500 hours",
            "talkTime": "8 hours",
            "type": "Lithium Ion (Li-Ion) (1500 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "1.9 GHz CDMA PCS, 800 MHz CDMA, EVDO Rev. A, 1xRTT",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g"
          },
          "description": "Android plus QWERTY is a powerful duo. LG Axis melds a speedy UI with the limitless micro-entertainment of 80,000+ apps including voice-activated Google. Feel the tactile vibration on its tempered glass touchscreen. Take the fuzziness out of your fun with a 3.2MP camera that does 360° panoramics. And customize your home screens with shortcuts to your apps, favorites, and widgets. It's the centerpiece of your life.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "3.2 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "",
            "cpu": "600 MHz Qualcomm MSM7627",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/lg-axis.0.jpg",
            "img/phones/lg-axis.1.jpg",
            "img/phones/lg-axis.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "56.0 mm (w)",
              "116.0 mm (h)",
              "16.0 mm (d)"
            ],
            "weight": "158.0 grams"
          },
          "storage": {
            "flash": "126MB",
            "ram": "256MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "samsung-galaxy-tab",
          "age": 8,
          "imageUrl": "./img/phones/samsung-galaxy-tab.0.jpg",
          "name": "Samsung Galaxy Tab™",
          "snippet": "Feel Free to Tab™. The Samsung Galaxy Tab™ brings you an ultra-mobile entertainment experience through its 7” display, high-power processor and Adobe® Flash® Player compatibility.",
          "additionalFeatures": "Adobe® Flash® Player compatible; 1.3MP front-facing camera for video chat; eReader pre-loaded; Swype text input technology\u000d\u000a",
          "android": {
            "os": "Android 2.2",
            "ui": "TouchWiz"
          },
          "availability": [
            "AT&amp;T,",
            "Sprint,",
            "T-Mobile,",
            "Verizon"
          ],
          "battery": {
            "standbyTime": "780 hours",
            "talkTime": "",
            "type": "Lithium Ion (Li-Ion) (4000 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 3.0",
            "cell": "AT&amp;T: GSM/EDGE : 850/900/1800/1900; 3G : 850/1900/2100&lt;p&gt;\u000d\u000a\u000d\u000aSprint: CDMA : 850/1900MHz&lt;p&gt;\u000d\u000a\u000d\u000aT-Mobile: GSM/EDGE : 850/900/1800/1900; 3G : 1700/1900&lt;p&gt;\u000d\u000a\u000d\u000aVerizon: CDMA : 800MHz/1900MHz",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Feel Free to Tab™. The Samsung Galaxy Tab™, the tablet device that delivers enhanced capabilities with advanced mobility, has a large, perfectly sized, 7.0\" screen that offers plenty of room for the thousands of interactive games and apps available for the Android™ platform, and its slim design makes it perfect for travel and one-handed grip. Use the Galaxy Tab to relax and enjoy an e-book, watch rich video or full web content with its Adobe® Flash® Player compatibility, video chat using the front-facing camera, or send user-generated content wirelessly to other devices like your TV via AllShare™.  With so many options for customization and interactivity, the Galaxy Tab gives you everything you want, anywhere you go…Feel Free to Tab™.",
          "display": {
            "screenResolution": "WSVGA (1024 x 600)",
            "screenSize": "7.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1GHz",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/samsung-galaxy-tab.0.jpg",
            "img/phones/samsung-galaxy-tab.1.jpg",
            "img/phones/samsung-galaxy-tab.2.jpg",
            "img/phones/samsung-galaxy-tab.3.jpg",
            "img/phones/samsung-galaxy-tab.4.jpg",
            "img/phones/samsung-galaxy-tab.5.jpg",
            "img/phones/samsung-galaxy-tab.6.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "120.39 mm (w)",
              "189.99 mm (h)",
              "11.9 mm (d)"
            ],
            "weight": "379.88 grams"
          },
          "storage": {
            "flash": "16384MB",
            "ram": "640MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "samsung-showcase-a-galaxy-s-phone",
          "age": 9,
          "imageUrl": "./img/phones/samsung-showcase-a-galaxy-s-phone.0.jpg",
          "name": "Samsung Showcase™ a Galaxy S™ phone",
          "snippet": "The Samsung Showcase™ delivers a cinema quality experience like you’ve never seen before. Its innovative 4” touch display technology provides rich picture brilliance, even outdoors",
          "additionalFeatures": "Swype",
          "android": {
            "os": "Android 2.1",
            "ui": "TouchWiz"
          },
          "availability": [
            "Cellular South"
          ],
          "battery": {
            "standbyTime": "800 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1500 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 3.0",
            "cell": "3G : 900MHz/1900MHz\u000aCDMA : 800MHz/1900MHz",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Experience entertainment in a whole new light. The stylish and slim Samsung Showcase™, with its vivid 4-inch Super AMOLED™ display, makes everything from Hollywood blockbusters to music videos to Amazon’s bestsellers look absolutely brilliant – even outside in the sun. Android™ Market rockets you into a universe filled with equally brilliant apps; download them at blistering speeds thanks to the powerful 1GHz Hummingbird processor. Keep your social life organized and continuously updated with the pre-loaded social networking apps, while uploading all the 5.0MP pics you’ve snapped and 720p HD videos you’ve recorded",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "4.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 GHz",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/samsung-showcase-a-galaxy-s-phone.0.jpg",
            "img/phones/samsung-showcase-a-galaxy-s-phone.1.jpg",
            "img/phones/samsung-showcase-a-galaxy-s-phone.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "64.2 mm (w)",
              "125.0 mm (h)",
              "9.97 mm (d)"
            ],
            "weight": "118.0 grams"
          },
          "storage": {
            "flash": "2048MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "droid-2-global-by-motorola",
          "age": 10,
          "imageUrl": "./img/phones/droid-2-global-by-motorola.0.jpg",
          "name": "DROID™ 2 Global by Motorola",
          "snippet": "The first smartphone with a 1.2 GHz processor and global capabilities.",
          "additionalFeatures": "Adobe Flash Player 10, Quadband GSM Worldphone, Advance Business Security, Complex Password Secure, Review & Edit Documents with Quick Office, Personal 3G Mobile Hotspot for up to 5 WiFi enabled Devices, Advanced Social Networking brings all social content into a single homescreen widget",
          "android": {
            "os": "Android 2.2",
            "ui": ""
          },
          "availability": [
            "Verizon"
          ],
          "battery": {
            "standbyTime": "230 hours",
            "talkTime": "8 hours",
            "type": "Lithium Ion (Li-Ion) (1400 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "WCDMA 850/1900/2100, CDMA 800/1900, GSM 850/900/1800/1900, HSDPA 10.2 Mbps (Category 9/10), CDMA EV-DO Release A, EDGE Class 12, GPRS Class 12, HSUPA 1.8 Mbps",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "With Quad Band GSM, the DROID 2 Global can send email and make and receive calls from more than 200 countries. It features an improved QWERTY keyboard, super-fast 1.2 GHz processor and enhanced security for all your business needs.",
          "display": {
            "screenResolution": "FWVGA (854 x 480)",
            "screenSize": "3.7 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1.2 GHz TI OMAP",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/droid-2-global-by-motorola.0.jpg",
            "img/phones/droid-2-global-by-motorola.1.jpg",
            "img/phones/droid-2-global-by-motorola.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "60.5 mm (w)",
              "116.3 mm (h)",
              "13.7 mm (d)"
            ],
            "weight": "169.0 grams"
          },
          "storage": {
            "flash": "8192MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "droid-pro-by-motorola",
          "age": 11,
          "imageUrl": "./img/phones/droid-pro-by-motorola.0.jpg",
          "name": "DROID™ Pro by Motorola",
          "snippet": "The next generation of DOES.",
          "additionalFeatures": "Adobe Flash Player 10, Quadband GSM Worldphone, Advance Business Security, Complex Password Secure, Review & Edit Documents with Quick Office, Personal 3G Mobile Hotspot for up to 5 WiFi enabled Devices, Advanced Social Networking brings all social content into a single homescreen widget",
          "android": {
            "os": "Android 2.2",
            "ui": ""
          },
          "availability": [
            "Verizon"
          ],
          "battery": {
            "standbyTime": "330 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1400 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "800/1900 CDMA EVDO Rev. A with dual diversity antenna, 850/900/1800/1900MHz GSM, GPRS Class 12, EDGE Class 12, 850/1900/2100 WCDMA (category 9/10), HSDPA 10.2mbps, HSUPA 1.8 mbps",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Access your work directory, email or calendar with DROID Pro by Motorola., an Android-for-business smartphone with corporate-level security. It features both a QWERTY keyboard and touchscreen, a speedy 1 GHz processor and Adobe® Flash® Player 10.",
          "display": {
            "screenResolution": "HVGA (480 x 320)",
            "screenSize": "3.1 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "1 GHz TI OMAP",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/droid-pro-by-motorola.0.jpg",
            "img/phones/droid-pro-by-motorola.1.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "61.0 mm (w)",
              "119.0 mm (h)",
              "11.7 mm (d)"
            ],
            "weight": "134.0 grams"
          },
          "storage": {
            "flash": "2048MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "motorola-bravo-with-motoblur",
          "age": 12,
          "imageUrl": "./img/phones/motorola-bravo-with-motoblur.0.jpg",
          "name": "MOTOROLA BRAVO™ with MOTOBLUR™",
          "snippet": "An experience to cheer about.",
          "additionalFeatures": "Adobe® Flash® Lite® 3, DNLA, CrystalTalk™ PLUS technology",
          "android": {
            "os": "Android 2.1",
            "ui": "MOTOBLUR™"
          },
          "availability": [
            "AT&amp;T"
          ],
          "battery": {
            "standbyTime": "216 hours",
            "talkTime": "6 hours",
            "type": "Lithium Ion (Li-Ion) (1540 mAH)"
          },
          "camera": {
            "features": [
              "Video"
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "WCDMA 850/1900, GSM 850/900/1800/1900, HSDPA 7.2 Mbps (Category 7/8), EDGE Class 12, GPRS Class 12, HSUPA 2.0 Mbps",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "MOTOROLA BRAVO™ with MOTOBLUR™ with its large 3.7-inch touchscreen and web-browsing capabilities is sure to make an impression.  And it keeps your life updated and secure through MOTOBLUR.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "3.7 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "800 Mhz",
            "fmRadio": true,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-bravo-with-motoblur.0.jpg",
            "img/phones/motorola-bravo-with-motoblur.1.jpg",
            "img/phones/motorola-bravo-with-motoblur.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "63.0 mm (w)",
              "109.0 mm (h)",
              "13.3 mm (d)"
            ],
            "weight": "130.0 grams"
          },
          "storage": {
            "flash": "",
            "ram": ""
          }
        }));
        dao.put(this.Phone.create({
          "id": "motorola-defy-with-motoblur",
          "age": 13,
          "imageUrl": "./img/phones/motorola-defy-with-motoblur.0.jpg",
          "name": "Motorola DEFY™ with MOTOBLUR™",
          "snippet": "Are you ready for everything life throws your way?",
          "additionalFeatures": "Blockbuster On Demand® movies and music downloads with connected music player\u000aWater-resistant and dustproof",
          "android": {
            "os": "Android 2.1",
            "ui": "MOTOBLUR"
          },
          "availability": [
            "SFR,",
            "T-Mobile,",
            "Vodafone"
          ],
          "battery": {
            "standbyTime": "400 hours",
            "talkTime": "6 hours",
            "type": "Lithium Ion (Li-Ion) (1540 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "WCDMA 850/1700/2100, GSM 850/900/1800/1900, HSDPA 7.2 Mbps (Category 7/8), EDGE Class 12, GPRS Class 12, HSUPA 2.0 Mbps",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "DEFY with MOTOBLUR is ready for everything life throws your way. It's water-resistant and dustproof, with plenty of entertainment options; and, with MOTOBLUR, it automatically delivers messages and status updates right to your home screen.",
          "display": {
            "screenResolution": "FWVGA (854 x 480)",
            "screenSize": "3.7 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "800 MHz TI OMAP3610",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-defy-with-motoblur.0.jpg",
            "img/phones/motorola-defy-with-motoblur.1.jpg",
            "img/phones/motorola-defy-with-motoblur.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "59.0 mm (w)",
              "107.0 mm (h)",
              "13.4 mm (d)"
            ],
            "weight": "118.0 grams"
          },
          "storage": {
            "flash": "2000MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "t-mobile-mytouch-4g",
          "age": 14,
          "imageUrl": "./img/phones/t-mobile-mytouch-4g.0.jpg",
          "name": "T-Mobile myTouch 4G",
          "snippet": "The T-Mobile myTouch 4G is a premium smartphone designed to deliver blazing fast 4G speeds so that you can video chat from practically anywhere, with or without Wi-Fi.",
          "additionalFeatures": "Mobile Video Chat, HD Camcorder, Screen Share (DLNA), Genius Button, Wi-Fi Calling, Wi-Fi HotSpot, T-Mobile TV, Slacker Radio, Rock Band, Monopoly, Asphalt 5, myModes, Faves Gallery",
          "android": {
            "os": "Android 2.2",
            "ui": "HTC Sense™"
          },
          "availability": [
            "T-Mobile"
          ],
          "battery": {
            "standbyTime": "285 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1400 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.0",
            "cell": "GSM: 850, 900, 1800, 1900; UMTS: Band I/IV",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "The myTouch 4G lets you connect fast, communicate easily, and share—all on America’s largest 4G network.\u000a\u000aBuilt with families in mind, the newest T-Mobile myTouch 4G helps solve the challenges of staying physically and emotionally connected by sharing photos and video with the HD Camcorder, spontaneous face-to-face conversations through Video Chat, and the ability to reach 4G speeds on T-Mobile’s HSPA+ network.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "3.8 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "2nd Generation 1GHz Qualcomm Snapdragon MSM8255",
            "fmRadio": true,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/t-mobile-mytouch-4g.0.jpg",
            "img/phones/t-mobile-mytouch-4g.1.jpg",
            "img/phones/t-mobile-mytouch-4g.2.jpg",
            "img/phones/t-mobile-mytouch-4g.3.jpg",
            "img/phones/t-mobile-mytouch-4g.4.jpg",
            "img/phones/t-mobile-mytouch-4g.5.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "62.5 mm (w)",
              "122.0 mm (h)",
              "11.0 mm (d)"
            ],
            "weight": "156.0 grams"
          },
          "storage": {
            "flash": "1100MB",
            "ram": "768MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "samsung-mesmerize-a-galaxy-s-phone",
          "age": 15,
          "imageUrl": "./img/phones/samsung-mesmerize-a-galaxy-s-phone.0.jpg",
          "name": "Samsung Mesmerize™ a Galaxy S™ phone",
          "snippet": "The Samsung Mesmerize™ delivers a cinema quality experience like you’ve never seen before. Its innovative 4” touch display technology provides rich picture brilliance,even outdoors",
          "additionalFeatures": "Swype",
          "android": {
            "os": "Android 2.1",
            "ui": "TouchWiz"
          },
          "availability": [
            "US Cellular"
          ],
          "battery": {
            "standbyTime": "1000 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1500 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 3.0",
            "cell": "3G :800MHz/1900MHz\u000aCDMA :800MHz/1900MHz",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Experience entertainment in a whole new light. The stylish and slim Samsung Mesmerize™, with its vivid 4-inch Super AMOLED™ display, makes everything from Hollywood blockbusters to music videos to Amazon’s bestsellers look absolutely brilliant – even outside in the sun. Android™ Market rockets you into a universe filled with equally brilliant apps; download them at blistering speeds thanks to the powerful 1GHz Hummingbird processor. Keep your social life organized and continuously updated with the pre-loaded social networking apps, while uploading all the 5.0MP pics you’ve snapped and 720p HD videos you’ve recorded.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "4.0 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "",
            "cpu": "1GHz",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/samsung-mesmerize-a-galaxy-s-phone.0.jpg",
            "img/phones/samsung-mesmerize-a-galaxy-s-phone.1.jpg",
            "img/phones/samsung-mesmerize-a-galaxy-s-phone.2.jpg",
            "img/phones/samsung-mesmerize-a-galaxy-s-phone.3.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "64.2 mm (w)",
              "125.0 mm (h)",
              "9.97 mm (d)"
            ],
            "weight": "118.0 grams"
          },
          "storage": {
            "flash": "2048MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "sanyo-zio",
          "age": 16,
          "imageUrl": "./img/phones/sanyo-zio.0.jpg",
          "name": "SANYO ZIO",
          "snippet": "The Sanyo Zio by Kyocera is an Android smartphone with a combination of ultra-sleek styling, strong performance and unprecedented value.",
          "additionalFeatures": "Trackball Navigation Control",
          "android": {
            "os": "Android 2.2",
            "ui": ""
          },
          "availability": [
            "Sprint"
          ],
          "battery": {
            "standbyTime": "",
            "talkTime": "4 hours",
            "type": "Lithium Ion (Li-Ion) (1130 mAH)"
          },
          "camera": {
            "features": [
              "Video"
            ],
            "primary": "3.2 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "CDMA2000 1xEV-DO Rev.A",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g"
          },
          "description": "Zio uses CDMA2000 1xEV-DO rev. A and Wi-Fi technologies and features a 3.5-inch WVGA touch-screen display as a backdrop for a fully customizable mobile multimedia experience.  Along with the touch-screen, a trackball helps users navigate features such as the 3.2 MP camera with video record/playback, media player and full HTML Web browser.  Zio supports up to 32GB through its external microSD memory slot.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "3.5 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "600MHz Qualcomm MSM7627",
            "fmRadio": false,
            "physicalKeyboard": false,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/sanyo-zio.0.jpg",
            "img/phones/sanyo-zio.1.jpg",
            "img/phones/sanyo-zio.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "58.6 mm (w)",
              "116.0 mm (h)",
              "12.2 mm (d)"
            ],
            "weight": "105.0 grams"
          },
          "storage": {
            "flash": "130MB",
            "ram": "256MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "samsung-transform",
          "age": 17,
          "imageUrl": "./img/phones/samsung-transform.0.jpg",
          "name": "Samsung Transform™",
          "snippet": "The Samsung Transform™ brings you a fun way to customize your Android powered touch screen phone to just the way you like it through your favorite themed “Sprint ID Service Pack”.",
          "additionalFeatures": "Access to Sprint ID Service Packs, front and rear facing cameras\u000a",
          "android": {
            "os": "Android 2.1",
            "ui": "Stock Android + Sprint ID Pack"
          },
          "availability": [
            "Sprint"
          ],
          "battery": {
            "standbyTime": "930 hours",
            "talkTime": "9 hours",
            "type": "Lithium Ion (Li-Ion) (1500 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "800Mhz, 1900MHz",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "Change your perspective.  The Samsung Transform™ is an Android powered device that delivers the truly customizable experience you want your phone to provide.  Enjoy a new and easy way to personalize your device for business or for entertainment, showcasing your own favorite theme and more through the new open software platform and the ability to download individual ‘Sprint ID Service Packs’ that combine and deliver multiple content items and applications specifically for the features you want.  Combine this with the 3.5” touch display, QWERTY keyboard, high-speed processor, and both a front and rear facing camera to bring your unique mobile experience to life.",
          "display": {
            "screenResolution": "HVGA (480 x 320)",
            "screenSize": "3.5 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "800 MHz",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/samsung-transform.0.jpg",
            "img/phones/samsung-transform.1.jpg",
            "img/phones/samsung-transform.2.jpg",
            "img/phones/samsung-transform.3.jpg",
            "img/phones/samsung-transform.4.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "61.5 mm (w)",
              "117.0 mm (h)",
              "15.3 mm (d)"
            ],
            "weight": "148.0 grams"
          },
          "storage": {
            "flash": "180MB",
            "ram": "384MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "t-mobile-g2",
          "age": 18,
          "imageUrl": "./img/phones/t-mobile-g2.0.jpg",
          "name": "T-Mobile G2",
          "snippet": "The T-Mobile G2 with Google is the first smartphone built for 4G speeds on T-Mobile's new network. Get the information you need, faster than you ever thought possible.",
          "additionalFeatures": "Accessibility features: tactile QWERTY keyboard, trackpad, three programmable keys, camera button",
          "android": {
            "os": "Android 2.2",
            "ui": "Android"
          },
          "availability": [
            "T-Mobile"
          ],
          "battery": {
            "standbyTime": "420 hours",
            "talkTime": "7 hours",
            "type": "Lithium Ion (Li-Ion) (1300 mAH)"
          },
          "camera": {
            "features": [
              "Flash",
              "Video"
            ],
            "primary": "5.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.1",
            "cell": "GSM: 850, 900, 1800, 1900  UMTS: Yes",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g/n"
          },
          "description": "The T-Mobile G1 was the world's first Android-powered phone. Launched nearly two years ago, it created an entirely new class of mobile phones and apps. Its successor, the T-Mobile G2 with Google, will continue the revolution.\u000a\u000aThe T-Mobile G2 will deliver tight integration with Google services and break new ground as the first smartphone designed to run at 4G speeds on our new HSPA+ network.",
          "display": {
            "screenResolution": "WVGA (800 x 480)",
            "screenSize": "3.7 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "800 MHz Qualcomm® Snapdragon™ MSM7230",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/t-mobile-g2.0.jpg",
            "img/phones/t-mobile-g2.1.jpg",
            "img/phones/t-mobile-g2.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "60.4 mm (w)",
              "119.0 mm (h)",
              "14.2 mm (d)"
            ],
            "weight": "180.0 grams"
          },
          "storage": {
            "flash": "4000MB",
            "ram": "512MB"
          }
        }));
        dao.put(this.Phone.create({
          "id": "motorola-charm-with-motoblur",
          "age": 19,
          "imageUrl": "./img/phones/motorola-charm-with-motoblur.0.jpg",
          "name": "Motorola CHARM™ with MOTOBLUR™",
          "snippet": "Motorola CHARM fits easily in your pocket or palm.  Includes MOTOBLUR service.",
          "additionalFeatures": "MOTOBLUR-enabled; battery manager; seven home screens; customize by moving or resizing widgets; Android HTML WebKit w/Flash Lite; BACKTRACK™ navigation pad behind screen",
          "android": {
            "os": "Android 2.1",
            "ui": "MOTOBLUR"
          },
          "availability": [
            "T-Mobile,",
            "Telus"
          ],
          "battery": {
            "standbyTime": "267 hours",
            "talkTime": "5 hours",
            "type": "Lithium Ion (Li-Ion) (1170 mAH)"
          },
          "camera": {
            "features": [
              "Video"
            ],
            "primary": "3.0 megapixels"
          },
          "connectivity": {
            "bluetooth": "Bluetooth 2.0",
            "cell": "WCDMA 1700/2100, GSM 850/900/1800/1900, HSDPA 3.6 Mbps (Category 5/6), EDGE Class 12, GPRS Class 12",
            "gps": true,
            "infrared": false,
            "wifi": "802.11 b/g"
          },
          "description": "Motorola CHARM fits easily in your pocket or palm. Includes MOTOBLUR so you can sync and merge your contacts, emails, messages and posts with continuous updates and back-ups.",
          "display": {
            "screenResolution": "QVGA (320 x 240)",
            "screenSize": "2.8 inches",
            "touchScreen": true
          },
          "hardware": {
            "accelerometer": true,
            "audioJack": "3.5mm",
            "cpu": "600 MHz",
            "fmRadio": false,
            "physicalKeyboard": true,
            "usb": "USB 2.0"
          },
          "images": [
            "img/phones/motorola-charm-with-motoblur.0.jpg",
            "img/phones/motorola-charm-with-motoblur.1.jpg",
            "img/phones/motorola-charm-with-motoblur.2.jpg"
          ],
          "sizeAndWeight": {
            "dimensions": [
              "67.2 mm (w)",
              "98.4 mm (h)",
              "11.4 mm (d)"
            ],
            "weight": "110.0 grams"
          },
          "storage": {
            "flash": "150MB",
            "ram": "512MB"
          }
        }));
        return dao;
      }
    }
  ]
});
