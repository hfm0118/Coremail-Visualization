import os
import numpy as np

def read_data(path, index):
    # rewritten
    path = os.path.join(path, str(index)+'.eml')
    with open(path,'r',encoding='utf-8') as f:
        lines = f.readlines()
    return lines

def parse_domain(path, index):
    # extract "gmail.com" from "From/To: xxx <whatever@gmail.com>"
    lines = read_data(path, index)
    efrom, eto = '', ''
    for i in range(len(lines)):
        line = lines[i].strip('\n')
        if 'To:' in line[:3]:            
            _rgt = line.rfind('>')
            if _rgt < 0:
                _rgt = len(line)
            _at = line.rfind('@', 0, _rgt)
            eto = line[_at+1:_rgt]            
            if _at < 0:
                eto = 'undisclosed recipients'
        if 'From:' in line[:5]:
            _at = line.rfind('@')
            if _at < 0 and i < len(lines)-1:
                line = lines[i+1].strip('\n')
            _rgt = line.rfind('>')           
            if _rgt < 0:
                _rgt = len(line)
            _at = line.rfind('@', 0, _rgt)
            efrom = line[_at+1:_rgt]
            if _at < 0:
                efrom = ''
    '''
    if len(efrom) < 1 or len(eto) < 1:
        print('{}: {}, {}'.format(index, efrom, eto))
        os.system('pause')
    '''
    return efrom, eto


def store_link(path = './dataset'):
    data = {}
    for i in range(1,5068):
        lines = read_data(path,i)
        efrom, eto = parse_domain(path, i)
        data[i] = [efrom, eto]
    # print(len(data))
    return data    


def get_data(path = './dataset'):    
    data = {}
    for i in range(1,5068):
        lines = read_data(path,i)
        efrom, eto = parse_domain(path, i)
        if len(efrom) > 0 and len(eto) > 0:
            if efrom not in data:
                data[efrom] = {}
            if eto not in data:
                data[eto] = {}
            if eto not in data[efrom]:
                data[efrom][eto] = 1
            else:
                data[efrom][eto] += 1
            if efrom not in data[eto]:
                data[eto][efrom] = 1
            else:
                data[eto][efrom] += 1
    # print(len(data))
    return data


def alter_data(dict):
    res = {"nodes":[], "links":[]}
    visited = []
    stat = []
    for key in dict:
        tot = sum(dict[key].values())
        stat.append((key, tot))
    stat = sorted(stat, key=lambda r:r[1], reverse=True)
    for i in range(len(stat)):
        key, tot = stat[i]
        res["nodes"].append({"id": key, "sum": tot})
        for key2 in dict[key]:
            if key2 not in visited:
                val = dict[key][key2]
                # val = 1+np.log2(val)
                res["links"].append({"source":key, "target":key2, "value":val})
        visited.append(key)
    return res