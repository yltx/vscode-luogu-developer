from selenium import webdriver
import json
import time

with open ('../tests/luogu.json','r') as f:
    a=json.loads(f.read())

with open ('../tests/cookie.json','r') as f:
    cookie = f.read();
print(cookie)
cookie_dic = {}
for i in cookie.split('; '):
    cookie_dic[i.split('=')[0]] = i.split('=')[1]
print(cookie_dic)

chrome_opts=webdriver.ChromeOptions()
chrome_opts.add_argument("--headless")

# browser = webdriver.Chrome(options=chrome_opts)
browser = webdriver.Chrome()
browser.get('https://www.luogu.com.cn/auth/login')


dictCookies=browser.get_cookies()
print(dictCookies)

cookie = []
for i in dictCookies:
        i=browser.get_cookie(i['name'])
        i['value']=cookie_dic[i['name']]
        cookie.append(i)
        # browser.add_cookie(i)
print('cookie')
print(cookie)

'''
c=browser.get_cookie('_uid')
c['value']=cookie_dic[c['name']]
browser.add_cookie(c);
print('correct cookie')
print(c,type(c))
'''

browser.get('https://www.luogu.com.cn/auth/login')

for i in cookie:
    str = i['name']
    print(str)
    c=browser.get_cookie(str)
    c['value']=cookie_dic[c['name']]
    print(c)
    browser.delete_cookie(str)
    browser.add_cookie(i)
'''
c=browser.get_cookie('CNZZDATA5476811')
c['value']=cookie_dic[c['name']]
browser.delete_cookie('CNZZDATA5476811')
browser.add_cookie(c)
browser.delete_cookie('CNZZDATA5476811')
browser.delete_cookie('CNZZDATA5476811')
browser.add_cookie(c)
print('correct cookie')
print(c,type(c))
'''
print('dictCookies')
dictCookies=browser.get_cookies()
print(dictCookies)

browser.find_element_by_xpath('//input[@placeholder="用户名、手机号或电子邮箱"]').send_keys(a['name'])
browser.find_element_by_xpath('//input[@placeholder="密码"]').send_keys(a["password"])
browser.find_element_by_xpath('//input[@placeholder="右侧图形验证码"]').send_keys(a["captcha"])
browser.find_element_by_xpath('//button[@type="button"]').click()


# browser.quit()

