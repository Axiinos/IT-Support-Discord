import os.path
from typing import Type
from importlib import reload


class UpdateCommand:

    def __init__(self):
        pass

    @classmethod
    def update(cls, command):
        try:
            reload(command)
            print(f"{command} was reloaded")
            return str(f"{command} reloaded")
        except NameError as e:
            print(f'the given input was not a command. {e}')
            raise e
