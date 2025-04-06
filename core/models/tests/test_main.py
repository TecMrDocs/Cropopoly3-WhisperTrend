from models.main import add

def test_add_positive_numbers():
    assert add(1, 2) == 3
    assert add(5, 7) == 12

def test_add_negative_numbers():
    assert add(-1, -2) == -3
    assert add(-5, -3) == -8

def test_add_mixed_numbers():
    assert add(-1, 2) == 1
    assert add(5, -3) == 2