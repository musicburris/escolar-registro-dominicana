from PySide6.QtWidgets import QApplication
from aulalocal.ui import MainWindow,Form
from aulalocal.catalog import MODULES
from conftest import student,staff,menu,receipt,expense

def test_all_pages_and_forms_render(store,tmp_path):
    app=QApplication.instance() or QApplication([])
    store.save_record('students',1,student());pid=store.save_record('staff',1,staff());mid=store.save_record('menus',1,menu());store.save_record('receipts',1,receipt(mid));store.save_record('expenses',1,expense())
    store.save_record('attendance',1,{'personal':pid,'fecha':'2026-09-01','estado':'Presente'})
    window=MainWindow(store);window.show();app.processEvents()
    for key in window.keys:
        window.current=key;window._render();app.processEvents()
        assert window.body.count()>0
    for kind in MODULES:
        form=Form(window,MODULES[kind][0],MODULES[kind][1],store=store,year=1)
        form.show();app.processEvents();assert set(form.values())=={f.key for f in MODULES[kind][1]};form.close()
    window.timer.stop();window.close();app.processEvents()

def test_navigation_hides_previous_page(store):
    app=QApplication.instance() or QApplication([])
    window=MainWindow(store);window.show();app.processEvents()
    old_title=window.body.itemAt(0).widget()
    window.nav.setCurrentRow(window.keys.index('students'));app.processEvents()
    assert not old_title.isVisible()
    assert window.current=='students'
    window.timer.stop();window.close()

def test_manual_lock_and_login_reopens_window(store):
    from PySide6.QtCore import QTimer
    from aulalocal.ui import Login
    from conftest import PASSWORD
    app=QApplication.instance() or QApplication([])
    window=MainWindow(store);window.show()
    def sign_in():
        login=next(w for w in app.topLevelWidgets() if isinstance(w,Login) and w.isVisible())
        login.inputs['username'].setText('director');login.inputs['password'].setText(PASSWORD);login.submit()
    QTimer.singleShot(20,sign_in)
    window.lock()
    assert app.main_window.isVisible() and store.user['username']=='director'
    app.main_window.timer.stop();app.main_window.close();app.setQuitOnLastWindowClosed(False)
