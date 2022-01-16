import os
import json

from gen import get_data, read_data, parse_domain, alter_data, store_link

if __name__=='__main__':

    data = get_data('./dataset')
    lnk = store_link()
    res = alter_data(data)

    # print(len(data))
    with open('./lnk.js', 'w') as f:
        f.write('fdg_lnk = ')
        f.write(json.dumps(lnk))
    with open('./fdg.js', 'w') as f:
        f.write('fdg_dat = ')
        f.write(json.dumps(res))
    


