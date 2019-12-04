#!/usr/local/bin/python
import pexpect
import threading
import subprocess
import time
import socket
import epics
import re
import sys
import time
import os
import exceptions

class Uut:
    def query_ioc_name(self):
        ioc_name_pv = 'IP:' + re.sub('\.', ':', self.ip)
        pv = epics.PV(ioc_name_pv, 
                     connection_timeout=5.0)
        
        try:
            self.epics_hn = pv.get()
        except TypeError:
            print("TypeError : no worries")
        except ArgumentError:
            print("ArgumentError")
        
        
    def __init__(self, _name):
#        print("Uut {}".format(_name))
	self.pv_trunc = re.compile('.*:')
        self.pvs = {}	    # pv values
	self._PVS = []	    # pv instances
        self.delay = 0
        self.name = _name
        self.ip = socket.gethostbyname(self.name)
        if self.ip != self.name:                
            self.name = re.sub('\..*', '', self.name)
            
        self.query_ioc_name()
        if self.epics_hn == None:
            if self.ip != self.name:                                
                self.epics_hn = self.name                
            else:
                print("No epics hn for %s" % self)
                
        
            
            
        
    def init(self):
        ping = pexpect.spawn("ping -c1 %s" % self.name)
        
    def __hash__(self):
        return hash(self.name)
    def __lt__(self, other):
        return self.epics_hn.__lt__(other.epics_hn)
    
    def __eq__(self, other):
        if not isinstance(other, type(self)): return NotImplemented
        return self.name == other.name  
    def __repr__(self):
        return "Uut(%s, %s, %s)" % (self.name, self.ip, self.epics_hn)
    
    def on_update(self, **kws):
#        self.pvs[re.sub(self.pv_trunc, '', kws['pvname'])] = kws['value']
        self.pvs[re.sub(self.pv_trunc, '', kws['pvname'])] = kws['char_value']
#        self.pvs[re.sub(self.pv_trunc, '', kws['pvname'])] = txt
        self.delay = 0	
     
    def uut_status_update(self):
	print("uut_status_update {} {} {}".format(self.epics_hn, threading.currentThread().ident, 01))
        for pvname in ( ':SYS:UPTIME', ':SYS:VERSION:SW', ':SYS:VERSION:FPGA', \
	                ':USER', ':TEST_DESCR', \
                        ':SYS:0:TEMP', ':1:SHOT', ':MODE:TRANS_ACT:STATE' 
			, ':2:SIG:ACQ1014:CLK_SRC', ':2:SIG:ACQ1014:TRG_SRC' 
#			, ':0:SIG:CLK_S1:FREQ', ':0:SIG:TRG_S1:FREQ'
			, ':0:SIG:CLK_MB:FREQ', ':0:SIG:CLK_MB:SET'
			):
	    self.pvs[re.sub(self.pv_trunc, '', pvname)] = '...'
            self._PVS.append(epics.PV(self.epics_hn + pvname, auto_monitor=True, form='native', callback=self.on_update))
	    
	print("uut_status_update {} {} {}".format(self.epics_hn, threading.currentThread().ident, 10))
	while self.delay < 60:
#	    print("uut_status_update {} {} {}".format(self.epics_hn, threading.currentThread().ident, 33))
	    time.sleep(2.0)
	    
	print("uut_status_update {} {} {}".format(self.epics_hn, threading.currentThread().ident, 66))
	for pv in self._PVS:
	    pv.disconnect()
	    self._PVS.remove(pv)
	print("uut_status_update {} {} {}".format(self.epics_hn, threading.currentThread().ident, 99))
	 

def blacklisted(uut):
    blacklist = ( "acq196", "acq164", "acq132", "acq216")
    for b in blacklist:
        if uut.startswith(b):
            return True
    return False

def cas_mon():
#    casw = subprocess.Popen(('casw', '-i', '2'), bufsize=-1, stdout=subprocess.PIPE)
#    casw =subprocess.Popen(('nc', 'acq2006_013', '54555'), bufsize=-1, stdout=subprocess.PIPE)
    casw =subprocess.Popen(('nc', 'acq2106_130', '54555'), bufsize=-1, stdout=subprocess.PIPE)
    expr = re.compile('  ([]\w.-]+):5064')
    blacklist = ( "acq196", "acq164", "acq132", "acq216")
    
    while True:
        out = casw.stdout.readline()
#        print("incoming:{}".format(out))
        if out == '' and casw.poll() != None:
            break
        match = expr.search(out)
        if match != None:
            uut = match.group(1)
            if not blacklisted(uut):
                yield(uut)
            
uuts = set()     

def _uut_mon(hn):
    global uuts
#    print("_uut_mon() hn:{}".format(hn))
    uut = Uut(str(hn))
    if not uut in uuts:
        print("New: %s" % uut)
        if uut.epics_hn != None:
            uuts.add(uut)
	    uut.uut_status_update()
            
            
def uut_mon():  
    global uuts
    for hn in cas_mon():
#        print("uut_mon() hn:{}".format(hn))
        threading.Thread(target=_uut_mon, args=(hn, )).start()
    
    
# BAD BAD BAD: impose form on function, to cope with xsl sequence difficulty ..    
        
TAGS= [
    ('UPTIME', 'Uptime'),
    ('TEMP', 'T0'),
    ('STATE', 'State'),
    ('SHOT', 'Shot'),
    ('SW', 'Software'),
    ('FPGA', 'FPGA'),
#    ('CLK_SRC', 'CLK14'),
#    ('CLK_S1_FREQ', 'CLK'),
#    ('TRG_SRC', 'TRG14'),
#    ('TRG_S1_FREQ', 'TRG'),
    ('SET', 'CLK Set'),
    ('FREQ', 'CLK Freq'),
    
    ('USER', 'User'),
    ('TEST_DESCR', 'Test'),
]
    

def xml_sequence(uut):
    global TAGS
    try:
        for key, label in TAGS:
            yield (key, uut.pvs[key])
    except KeyError:
        return
   
def xml_headers():
    global TAGS
    for label in ('Delay', 'UUT'):
	yield label
    for key, label in TAGS:
	yield label
    
            
if os.getenv("MULTIMON_CUSTOM") != None:
    import multimon_custom
    multimon_custom.register(TAGS, uuts)

uut_monitor = threading.Thread(target=uut_mon)
uut_monitor.setDaemon(True)
uut_monitor.start()

DATFILE = 'multimon_acq400.xml'
DATFTMP = DATFILE + '.new'

while True:  
    with open(DATFTMP, 'w') as xml:
        xml.write('<?xml version="1.0" encoding="UTF-8"?>\n')
	xml.write("<body>\n")
	xml.write("    <header>\n")
        xml.write("        <ts>{}</ts>\n".format(time.strftime("%a, %d %b %T %Z %Y" )))
	xml.write("        <cheads>\n")
	for ch in xml_headers():	    
	    xml.write('            <h1>{}</h1>\n'.format(ch))	
	xml.write("        </cheads>\n")
	xml.write("     </header>\n")
        for uut in sorted(uuts):
            xml.write("    <record>\n")
            xml.write('        <acq400monitor dt="{}"/>\n'.format(uut.delay))
	    
            xml.write("        <info>\n")        
            xml.write("            <host ip=\"{}\">{}</host>\n".format(socket.gethostbyname(uut.epics_hn), uut.epics_hn))
            
            for key, value in xml_sequence(uut):
                xml.write("            <{}>{}</{}>\n".format(key, value, key))
                            
            xml.write("        </info>\n")
            xml.write("    </record>\n")
            uut.delay += 1
            if uut.delay > 60:
                uuts.remove(uut)
            
        xml.write("</body>\n")

    try:        
	os.rename(DATFTMP, DATFILE)
    except OSError:
	print("OSError")

    time.sleep(0.5)



    
    

    
    
