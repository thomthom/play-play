from setuptools import setup, find_packages

setup(
    name='playplay',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask==0.12.2',
        'python-dateutil==2.6.1',
    ],
    setup_requires=[
        'pytest-runner',
    ],
    tests_require=[
        'pytest',
    ],
)
